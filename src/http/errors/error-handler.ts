import { FastifyInstance } from 'fastify'
import { InvalidTripDatesError } from './invalid-trip-dates-error'
import { ParticipantNotFoundError } from './participant-not-found-error'
import { TripNotFoundError } from './trip-not-found-error'
import { ZodError } from 'zod'

type FatifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FatifyErrorHandler = (error, request, reply) => {
  if (
    error instanceof InvalidTripDatesError ||
    ParticipantNotFoundError ||
    TripNotFoundError
  ) {
    return reply.status(400).send({ message: error.message })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Invalid input',
      errors: error.flatten().fieldErrors,
    })
  }

  return reply.status(500).send({ message: 'Internal server error' })
}
