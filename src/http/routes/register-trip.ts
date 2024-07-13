import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import dayjs from 'dayjs'
import { getMailClient } from '../../lib/email'
import nodemailer from 'nodemailer'
import {
  formattedEndDate,
  formattedStartDate,
} from '../../utils/formattedDates'

export async function registerTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        tags: ['Register'],
        summary: 'Register new Trip',
        body: z.object({
          destination: z.string(),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string()),
        }),
      },
    },
    async (request, reply) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite,
      } = request.body

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error('Invalid trip start date.')
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error('Invalid trip end date.')
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          Participant: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_confirmed: true,
                  is_owner: true,
                },
                ...emails_to_invite.map((email) => {
                  return { email }
                }),
              ],
            },
          },
        },
      })

      const mail = await getMailClient()

      const startFormattedDate = formattedStartDate(starts_at)
      const endFormattedDate = formattedEndDate(ends_at)

      const confirmationLink = `http:localhost:3333/trips/${trip.id}/confirmed`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe travel.planned',
          address: 'oi@travelplanned.com',
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: `Confirme sua viagem para ${destination} em ${startFormattedDate}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${startFormattedDate}</strong> até <strong>${endFormattedDate}</strong> de Agosto.</p>
            <p></p>
            <p>Para confirmar sua viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>        
        
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return reply.status(201).send({ tripId: trip.id })
    },
  )
}
