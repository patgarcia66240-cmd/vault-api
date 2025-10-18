import { JWT as FastifyJWT } from '@fastify/jwt';
export interface JWTPayload {
    sub: string;
    email: string;
    plan: 'FREE' | 'PRO';
}
export declare const generateJWT: (jwt: FastifyJWT, payload: JWTPayload) => string;
export declare const verifyJWT: (jwt: FastifyJWT, token: string) => JWTPayload;
//# sourceMappingURL=jwt.d.ts.map