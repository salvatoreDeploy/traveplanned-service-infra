import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import dayjs from 'dayjs'
import { InvalidTripDatesError } from '../errors/invalid-trip-dates-error'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trip/:tripId/activity',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Create activity',
        params: z.object({
          tripId: z.string(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { title, occurs_at } = request.body
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new Error('Trip not found')
      }

      if (dayjs(occurs_at).isBefore(trip.starts_at)) {
        throw new InvalidTripDatesError('Invalid activity date.')
      }

      if (dayjs(occurs_at).isAfter(trip.ends_at)) {
        throw new InvalidTripDatesError('Invalid actvity date.')
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId,
        },
      })

      return reply.status(201).send({ activityId: activity.id })
    },
  )
}
