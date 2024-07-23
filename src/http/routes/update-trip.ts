import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import dayjs from 'dayjs'
import { TripNotFoundError } from '../errors/trip-not-found-error'
import { InvalidTripDatesError } from '../errors/invalid-trip-dates-error'

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trip/:tripId',
    {
      schema: {
        tags: ['Register'],
        summary: 'Update a Trip',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string(),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { destination, starts_at, ends_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found.')
      }

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new InvalidTripDatesError('Invalid trip start date.')
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new InvalidTripDatesError('Invalid trip end date.')
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          starts_at,
          ends_at,
        },
      })

      return reply.status(201).send({ tripId: trip.id })
    },
  )
}
