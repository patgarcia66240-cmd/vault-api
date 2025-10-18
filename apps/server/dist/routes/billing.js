import { createCheckoutSession, handleWebhook, getUserInvoices } from '../services/billing';
export const billingRoutes = async (fastify) => {
    fastify.post('/checkout', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user;
            const result = await createCheckoutSession(user.sub, user.email);
            return reply.send(result);
        }
        catch (error) {
            fastify.log.error(error);
            if (error instanceof Error && error.message === 'User already has PRO plan') {
                return reply.status(409).send({ error: 'User already has PRO plan' });
            }
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    fastify.get('/invoices', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user;
            const invoices = await getUserInvoices(user.sub);
            return reply.send({ invoices });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    fastify.post('/webhook', {
        config: {
            rawBody: true
        }
    }, async (request, reply) => {
        try {
            const signature = request.headers['stripe-signature'];
            const payload = Buffer.from(request.body);
            await handleWebhook(payload, signature);
            return reply.send({ received: true });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({ error: 'Webhook error' });
        }
    });
};
//# sourceMappingURL=billing.js.map