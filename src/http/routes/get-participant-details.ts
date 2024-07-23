import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { TripNotFoundError } from '../errors/trip-not-found-error'

export async function getParticipantDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Get participant details',
        params: z.object({
          participantId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params

      const participant = await prisma.participant.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new TripNotFoundError('Trip not found')
      }

      return reply.status(200).send({ participant })
    },
  )
}
