import { z } from 'zod';
export const createApiKeySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    value: z.string().min(20, 'API key must be at least 20 characters').max(200, 'API key must be less than 200 characters').optional()
});
export const revokeApiKeySchema = z.object({
    id: z.string().cuid('Invalid API key ID')
});
//# sourceMappingURL=apiKey.js.map