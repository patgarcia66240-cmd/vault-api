import { CreateApiKeyInput } from '../schemas/apiKey';
export declare const createApiKey: (userId: string, input: CreateApiKeyInput) => Promise<{
    apiKey: string;
    prefix: string;
    last4: string;
    name: string;
    createdAt: Date;
}>;
export declare const getUserApiKeys: (userId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    prefix: string;
    last4: string;
    revoked: boolean;
}[]>;
export declare const revokeApiKey: (userId: string, apiKeyId: string) => Promise<{
    success: boolean;
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