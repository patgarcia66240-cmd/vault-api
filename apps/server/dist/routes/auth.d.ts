import { FastifyInstance } from 'fastify';
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
    }
}
export declare const authRoutes: (fastify: FastifyInstance) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map