import { JWTPayload } from '../libs/jwt';
import { SignupInput, LoginInput } from '../schemas/auth';
export declare const signup: (input: SignupInput) => Promise<{
    user: {
        id: string;
        email: string;
        plan: string;
    };
}>;
export declare const login: (input: LoginInput, jwt: any) => Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        plan: string;
    };
}>;
export declare const getUserById: (userId: string) => Promise<{
    email: string;
    id: string;
    plan: string;
    stripeId: string | null;
    createdAt: Date;
} | null>;
export declare const verifyToken: (token: string, jwt: any) => JWTPayload;
//# sourceMappingURL=auth.d.ts.map