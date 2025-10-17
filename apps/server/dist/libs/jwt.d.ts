import { FastifyJWT } from '@fastify/jwt';
export interface JWTPayload {
    sub: string;
    email: string;
    plan: 'FREE' | 'PRO';
}
export declare const generateJWT: (jwt: FastifyJWT, payload: JWTPayload) => any;
export declare const verifyJWT: (jwt: FastifyJWT, token: string) => any;
//# sourceMappingURL=jwt.d.ts.map