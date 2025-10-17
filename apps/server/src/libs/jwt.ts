import { JWT as FastifyJWT } from '@fastify/jwt'

export interface JWTPayload {
  sub: string
  email: string
  plan: 'FREE' | 'PRO'
}

export const generateJWT = (jwt: FastifyJWT, payload: JWTPayload) => {
  return jwt.sign(payload)
}

export const verifyJWT = (jwt: FastifyJWT, token: string) => {
  return jwt.verify<JWTPayload>(token)
}
