import Stripe from 'stripe';
export declare const stripe: Stripe;
export declare const createCheckoutSession: (userId: string, userEmail: string) => Promise<{
    url: string | null;
}>;
export declare const handleWebhook: (payload: Buffer, signature: string) => Promise<{
    received: boolean;
}>;
//# sourceMappingURL=billing.d.ts.map