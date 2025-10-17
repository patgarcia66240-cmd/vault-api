import { createApiKey, getUserApiKeys, revokeApiKey } from '../services/apiKey';
export const apiKeyRoutes = async (fastify) => {
    fastify.post('/keys', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const result = await createApiKey(request.user.sub, request.body);
            return reply.status(201).send(result);
        }
        catch (error) {
            fastify.log.error(error);
            if (error instanceof Error && error.message === 'Free plan limited to 3 API keys') {
                return reply.status(403).send({ error: 'Free plan limited to 3 API keys' });
            }
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    fastify.get('/keys', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const apiKeys = await getUserApiKeys(request.user.sub);
            return reply.send({ apiKeys });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    fastify.delete('/keys/:id', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            await revokeApiKey(request.user.sub, request.params.id);
            return reply.send({ success: true });
        }
        catch (error) {
            fastify.log.error(error);
            if (error instanceof Error && error.message === 'API key not found') {
                return reply.status(404).send({ error: 'API key not found' });
            }
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
};
//# sourceMappingURL=apiKey.js.map