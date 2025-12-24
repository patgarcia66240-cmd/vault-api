import { z } from 'zod';
declare const supabaseConfigSchema: z.ZodObject<{
    url: z.ZodString;
    anonKey: z.ZodString;
    serviceRoleKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
}, {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
}>;
export declare const createApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
    provider: z.ZodDefault<z.ZodEnum<["CUSTOM", "SUPABASE"]>>;
    providerConfig: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        anonKey: z.ZodString;
        serviceRoleKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    }, {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    provider: "CUSTOM" | "SUPABASE";
    value?: string | undefined;
    providerConfig?: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    } | undefined;
}, {
    name: string;
    value?: string | undefined;
    provider?: "CUSTOM" | "SUPABASE" | undefined;
    providerConfig?: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    } | undefined;
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
export type SupabaseConfig = z.infer<typeof supabaseConfigSchema>;
export {};
//# sourceMappingURL=apiKey.d.ts.map