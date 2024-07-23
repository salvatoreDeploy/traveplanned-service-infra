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
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          Participant: {
            where: {
              is_owner: false,
            },
          },
        },
      })

      if (!trip) {
        throw new TripNotFoundError('Trip not found')
      }

      if (trip.is_confimed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          is_confimed: true,
        },
      })

      const mail = await getMailClient()

      const startFormattedDate = formattedStartDate(trip.starts_at)
      const endFormattedDate = formattedEndDate(trip.ends_at)

      await Promise.all(
        trip.Participant.map(async (participant) => {
          const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirmed`

          const message = await mail.sendMail({
            from: {
              name: 'Equipe travel.planned',
              address: 'oi@travelplanned.com',
            },
            to: participant.email,
            subject: `Confirme sua presença na viagem para ${trip.destination} em ${startFormattedDate}`,
            html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${startFormattedDate}</strong> até <strong>${endFormattedDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
        
        `.trim(),
          })

          console.log(nodemailer.getTestMessageUrl(message))
        }),
      )

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    },
  )
}
