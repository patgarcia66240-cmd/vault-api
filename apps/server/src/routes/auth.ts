import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { signup, login } from '../services/auth'
import { SignupInput, LoginInput } from '../schemas/auth'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
  }
}

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/signup', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: SignupInput }>, reply: FastifyReply) => {
    try {
      const result = await signup(request.body)
      return reply.status(201).send(result)
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof Error && error.message === 'User already exists') {
        return reply.status(409).send({ error: 'User already exists' })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    try {
      const result = await login(request.body, fastify.jwt)

      reply.setCookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      })

      return reply.send({
        user: result.user
      })
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('token', { path: '/' })
    return reply.send({ message: 'Logged out successfully' })
  })

  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      user: request.user
    })
  })
}
