import { z } from 'zod';
export declare const createApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value?: string | undefined;
}, {
    name: string;
    value?: string | undefined;
}>;
export declare const revokeApiKeySchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type RevokeApiKeyInput = z.infer<typeof revokeApiKeySchema>;
//# sourceMappingURL=apiKey.d.ts.map