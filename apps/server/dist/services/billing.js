import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
const prisma = new PrismaClient();
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
export const getUserInvoices = async (userId) => {
    return await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};
export const createCheckoutSession = async (userId, userEmail) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new Error('User not found');
    }
    if (user.plan === 'PRO') {
        throw new Error('User already has PRO plan');
    }
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_PRO,
                quantity: 1
            }
        ],
        success_url: `${process.env.WEB_BASE_URL}/billing?success=true`,
        cancel_url: `${process.env.WEB_BASE_URL}/pricing?canceled=true`,
        metadata: {
            userId
        }
    });
    return { url: session.url };
};
export const handleWebhook = async (payload, signature) => {
    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        throw new Error(`Webhook signature verification failed: ${err}`);
    }
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        plan: 'PRO',
                        stripeId: session.customer
                    }
                });
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object;
            const customerId = invoice.customer;
            // Trouver l'utilisateur par stripeId
            const user = await prisma.user.findUnique({
                where: { stripeId: customerId }
            });
            if (user) {
                // Créer ou mettre à jour la facture dans notre DB
                await prisma.invoice.upsert({
                    where: { stripeInvoiceId: invoice.id },
                    update: {
                        status: 'paid',
                        amount: invoice.amount_paid,
                        currency: invoice.currency,
                        invoicePdf: invoice.invoice_pdf,
                        hostedInvoiceUrl: invoice.hosted_invoice_url,
                        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
                    },
                    create: {
                        userId: user.id,
                        stripeInvoiceId: invoice.id,
                        amount: invoice.amount_paid,
                        currency: invoice.currency,
                        status: 'paid',
                        invoicePdf: invoice.invoice_pdf,
                        hostedInvoiceUrl: invoice.hosted_invoice_url,
                        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
                    }
                });
            }
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            const customerId = invoice.customer;
            // Trouver l'utilisateur par stripeId
            const user = await prisma.user.findUnique({
                where: { stripeId: customerId }
            });
            if (user) {
                // Créer la facture échouée
                await prisma.invoice.upsert({
                    where: { stripeInvoiceId: invoice.id },
                    update: {
                        status: 'open',
                        amount: invoice.amount_due,
                    },
                    create: {
                        userId: user.id,
                        stripeInvoiceId: invoice.id,
                        amount: invoice.amount_due,
                        currency: invoice.currency,
                        status: 'open',
                        hostedInvoiceUrl: invoice.hosted_invoice_url,
                    }
                });
                await prisma.user.update({
                    where: { id: user.id },
                    data: { plan: 'FREE' }
                });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            const user = await prisma.user.findUnique({
                where: { stripeId: customerId }
            });
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { plan: 'FREE' }
                });
            }
            break;
        }
    }
    return { received: true };
};
//# sourceMappingURL=billing.js.map