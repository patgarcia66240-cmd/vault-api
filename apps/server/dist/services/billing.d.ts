import Stripe from 'stripe';
export declare const stripe: Stripe;
export declare const getUserInvoices: (userId: string) => Promise<{
    status: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    stripeInvoiceId: string;
    amount: number;
    currency: string;
    invoicePdf: string | null;
    hostedInvoiceUrl: string | null;
    description: string | null;
    periodStart: Date | null;
    periodEnd: Date | null;
}[]>;
export declare const createCheckoutSession: (userId: string, userEmail: string) => Promise<{
    url: string | null;
}>;
export declare const handleWebhook: (payload: Buffer, signature: string) => Promise<{
    received: boolean;
}>;
//# sourceMappingURL=billing.d.ts.map