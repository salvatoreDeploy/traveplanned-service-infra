import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { TripNotFoundError } from '../errors/trip-not-found-error'

export async function getLinks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trip/:tripId/links',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Get links',
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
          Link: true,
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found.')
      }

      return reply.status(201).send({ links: trip.Link })
    },
  )
}
