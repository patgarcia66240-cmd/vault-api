import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import { Server } from 'http'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { mockAuthRoutes } from './routes/mockAuth'

export const createServer = async (): Promise<FastifyInstance<Server>> => {
  const server = Fastify<Server>({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    },
    trustProxy: true
  })

  // Register plugins
  await server.register(cors, {
    origin: [
      process.env.WEB_BASE_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5173'
    ],
    credentials: true
  })

  await server.register(cookie, {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
  })

  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
  })

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  // JWT authentication decorator
  server.decorate('authenticate', async (request: FastifyRequest, reply: any) => {
    try {
      const token = request.cookies.token
      if (!token) {
        throw new Error('No token provided')
      }

      const decoded = server.jwt.verify(token) as any
      request.user = decoded
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  // Error handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error)

    if (error.validation) {
      reply.status(400).send({
        error: 'Validation Error',
        details: error.validation
      })
      return
    }

    reply.status(500).send({
      error: 'Internal Server Error'
    })
  })

  // Health check
  server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Register routes
  await server.register(mockAuthRoutes, { prefix: '/api/auth' })

  return server
}
