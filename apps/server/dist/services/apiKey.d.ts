import { CreateApiKeyInput } from '../schemas/apiKey';
export declare const createApiKey: (userId: string, input: CreateApiKeyInput) => Promise<{
    apiKey: string;
    prefix: string;
    last4: string;
    name: string;
    provider: "SUPABASE";
    providerConfig: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    createdAt: Date;
} | {
    apiKey: string;
    prefix: string;
    last4: string;
    name: string;
    provider: string;
    createdAt: Date;
    providerConfig?: undefined;
}>;
export declare const getUserApiKeys: (userId: string) => Promise<{
    id: string;
    name: string;
    provider: string;
    providerConfig: any;
    prefix: string;
    last4: string;
    revoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const revokeApiKey: (userId: string, apiKeyId: string) => Promise<{
    success: boolean;
}>;
export declare const getDecryptedApiKey: (userId: string, apiKeyId: string) => Promise<{
    apiKey: string;
    name: string;
    prefix: string;
    last4: string;
}>;
export declare const validateApiKey: (apiKeyHash: string) => Promise<{
    apiKey: {
        id: string;
        name: string;
        prefix: string;
        last4: string;
    };
    user: {
        email: string;
        id: string;
        plan: string;
    };
} | null>;
//# sourceMappingURL=apiKey.d.ts.map