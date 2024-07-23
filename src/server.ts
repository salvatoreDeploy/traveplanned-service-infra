import fastify from 'fastify'
import { registerTrip } from './http/routes/register-trip'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { confirmTrip } from './http/routes/confirm-trip'
import { confirmedPaticipant } from './http/routes/confirmed-participant'
import { createActivity } from './http/routes/create-activity'
import { getActivities } from './http/routes/get-activities'
import { createLnk } from './http/routes/create-link'
import { getLinks } from './http/routes/get-links'
import { getParticipants } from './http/routes/get-participants'
import { createInvite } from './http/routes/create-invite'
import { updateTrip } from './http/routes/update-trip'
import { getTripDetails } from './http/routes/get-trip-details'
import { getParticipantDetails } from './http/routes/get-participant-details'
import { env } from './env/env'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Travel Planned Api',
      description: 'API de gerenciamento e planejamento de Viagens',
      version: '1.0.0',
    },
    components: {},
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(registerTrip)
app.register(confirmTrip)
app.register(confirmedPaticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLnk)
app.register(getLinks)
app.register(getParticipants)
app.register(createInvite)
app.register(updateTrip)
app.register(getTripDetails)
app.register(getParticipantDetails)

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => console.log('🚀 HTTP Server Running!'))
