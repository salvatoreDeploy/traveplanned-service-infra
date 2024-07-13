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

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => console.log('🚀 HTTP Server Running!'))
