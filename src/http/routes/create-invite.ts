import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../database/prisma'
import { getMailClient } from '../../lib/email'
import {
  formattedEndDate,
  formattedStartDate,
} from '../../utils/formattedDates'
import nodemailer from 'nodemailer'
import { TripNotFoundError } from '../errors/trip-not-found-error'
import { env } from '../../env/env'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trip/:tripId/inivite',
    {
      schema: {
        tags: ['Road Map'],
        summary: 'Create new inivite',
        params: z.object({
          tripId: z.string(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found.')
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: trip.id,
        },
      })

      const mail = await getMailClient()

      const startFormattedDate = formattedStartDate(trip.starts_at)
      const endFormattedDate = formattedEndDate(trip.ends_at)

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirmed`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe travel.planned',
          address: 'oi@travelplanned.com',
        },
        to: participant.email,

        subject: `Confirme sua viagem para ${trip.destination} em ${startFormattedDate}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você foi convidado(a) para uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${startFormattedDate}</strong> até <strong>${endFormattedDate}</strong> de Agosto.</p>
            <p></p>
            <p>Para confirmar sua presença, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>        
        
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return reply.status(201).send({ participantId: participant.id })
    },
  )
}
