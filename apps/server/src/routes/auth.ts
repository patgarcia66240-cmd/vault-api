import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { signup, login } from '../services/auth'
import { signupSchema, loginSchema } from '../schemas/auth'

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/signup', {}, async (request: FastifyRequest, reply: FastifyReply) => {
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

  fastify.post('/login', {}, async (request: FastifyRequest, reply: FastifyReply) => {
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