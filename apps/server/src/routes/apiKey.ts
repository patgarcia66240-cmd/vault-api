import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createApiKey, getUserApiKeys, revokeApiKey } from '../services/apiKey'
import { createApiKeySchema } from '../schemas/apiKey'
import { JWTPayload } from '../libs/jwt'

export const apiKeyRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/keys', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload

      const parsedBody = createApiKeySchema.safeParse(request.body)
      if (!parsedBody.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: parsedBody.error.flatten()
        })
      }

      const result = await createApiKey(user.sub, parsedBody.data)
      return reply.status(201).send(result)
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof Error && error.message === 'Free plan limited to 3 API keys') {
        return reply.status(403).send({ error: 'Free plan limited to 3 API keys' })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.get('/keys', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload
      const apiKeys = await getUserApiKeys(user.sub)
      return reply.send({ apiKeys })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.delete('/keys/:id', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload
      await revokeApiKey(user.sub, (request.params as { id: string }).id)
      return reply.send({ success: true })
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof Error && error.message === 'API key not found') {
        return reply.status(404).send({ error: 'API key not found' })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
