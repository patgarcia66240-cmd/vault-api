import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createCheckoutSession, handleWebhook } from '../services/billing'
import { JWTPayload } from '../libs/jwt'

export const billingRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/checkout', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload
      const result = await createCheckoutSession(user.sub, user.email)
      return reply.send(result)
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof Error && error.message === 'User already has PRO plan') {
        return reply.status(409).send({ error: 'User already has PRO plan' })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.post('/webhook', {
    config: {
      rawBody: true
    } as any
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const signature = request.headers['stripe-signature'] as string
      const payload = Buffer.from(request.body as string)

      await handleWebhook(payload, signature)
      return reply.send({ received: true })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(400).send({ error: 'Webhook error' })
    }
  })
}
