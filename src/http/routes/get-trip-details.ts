import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { TripNotFoundError } from '../errors/trip-not-found-error'

export async function getTripDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId/details',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Get trip details',
        params: z.object({
          tripId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        select: {
          id: true,
          destination: true,
          starts_at: true,
          ends_at: true,
          is_confimed: true,
        },
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found.')
      }

      return reply.status(201).send({ trip })
    },
  )
}
