import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { TripNotFoundError } from '../errors/trip-not-found-error'

export async function getParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId/participants',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Get participants',
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
        select: {
          destination: true,
          Participant: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
            },
          },
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found')
      }

      return reply.status(201).send({ participants: trip })
    },
  )
}
