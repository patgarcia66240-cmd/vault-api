interface User {
    id: string;
    email: string;
    passwordHash: string;
    plan: string;
    stripeId?: string;
    createdAt: string;
    updatedAt: string;
}
interface ApiKey {
    id: string;
    userId: string;
    name: string;
    prefix: string;
    last4: string;
    encCiphertext: Buffer;
    encNonce: Buffer;
    hash: string;
    revoked: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare const mockDb: {
    users: User[];
    apiKeys: ApiKey[];
};
export {};
//# sourceMappingURL=mockData.d.ts.map