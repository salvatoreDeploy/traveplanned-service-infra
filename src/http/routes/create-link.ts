import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { TripNotFoundError } from '../errors/trip-not-found-error'

export async function createLnk(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trip/:tripId/link',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Create links',
        params: z.object({
          tripId: z.string(),
        }),
        body: z.object({
          title: z.string().min(4),
          url: z.string().url(),
        }),
      },
    },
    async (request, reply) => {
      const { title, url } = request.body

      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found.')
      }

      const link = await prisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId,
        },
      })

      return reply.status(201).send({ linkId: link.id })
    },
  )
}
