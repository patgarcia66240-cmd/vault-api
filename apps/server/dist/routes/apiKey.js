import { createApiKey, getUserApiKeys, revokeApiKey, getDecryptedApiKey } from '../services/apiKey';
import { createApiKeySchema } from '../schemas/apiKey';
export const apiKeyRoutes = async (fastify) => {
    fastify.post('/keys', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user;
            const parsedBody = createApiKeySchema.safeParse(request.body);
            if (!parsedBody.success) {
                return reply.status(400).send({
                    error: 'Validation error',
                    details: parsedBody.error.flatten()
                });
            }
            const result = await createApiKey(user.sub, parsedBody.data);
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
            const user = request.user;
            const apiKeys = await getUserApiKeys(user.sub);
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
            const user = request.user;
            await revokeApiKey(user.sub, request.params.id);
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
    fastify.get('/keys/:id/decrypt', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user;
            const apiKeyId = request.params.id;
            const result = await getDecryptedApiKey(user.sub, apiKeyId);
            return reply.send(result);
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