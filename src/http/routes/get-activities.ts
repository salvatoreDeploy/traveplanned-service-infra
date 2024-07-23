import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { differenceInDaysBetweenTripStartAndEnd } from '../../utils/differenceInDaysBetweenTripStartAndEnd'
import dayjs from 'dayjs'
import { TripNotFoundError } from '../errors/trip-not-found-error'

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId/activities',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Get activities',
        params: z.object({
          tripId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          Activity: {
            orderBy: {
              occurs_at: 'asc',
            },
          },
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found')
      }

      const activities = Array.from({
        length:
          differenceInDaysBetweenTripStartAndEnd(trip.starts_at, trip.ends_at) +
          1,
      }).map((_, index) => {
        const date = dayjs(trip.starts_at).add(index, 'days')

        console.log(date.toDate())

        return {
          date: date.toDate(),
          activities: trip.Activity.filter((activity) => {
            return dayjs(activity.occurs_at).isSame(date, 'days')
          }),
        }
      })

      return reply.status(201).send({ activities })
    },
  )
}
