import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirmed',
    {
      schema: {
        tags: ['Confirmed'],
        summary: 'Appointment confirmation trip',
        params: z.object({
          tripId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      return reply.status(200).send({ tripId: request.params.tripId })
    },
  )
}
