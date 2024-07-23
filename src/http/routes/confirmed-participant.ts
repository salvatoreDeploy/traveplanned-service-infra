import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { ParticipantNotFoundError } from '../errors/participant-not-found-error'
import { env } from '../../env/env'

export async function confirmedPaticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId/confirmed',
    {
      schema: {
        tags: ['Confirmed'],
        summary: 'Confirm participant a trip',
        params: z.object({
          participantId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new ParticipantNotFoundError('Participant not found.')
      }

      if (participant.is_confirmed) {
        return reply.redirect(
          `${env.WEB_BASE_URL}/trips/${participant.trip_id}`,
        )
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: {
          is_confirmed: true,
        },
      })

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
    },
  )
}
