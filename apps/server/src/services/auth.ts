import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { generateJWT, verifyJWT, JWTPayload } from '../libs/jwt'
import { SignupInput, LoginInput } from '../schemas/auth'

const prisma = new PrismaClient()
const SALT_ROUNDS = 12

export const signup = async (input: SignupInput) => {
  const { email, password } = input

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      plan: 'FREE'
    }
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan
    }
  }
}

export const login = async (input: LoginInput, jwt: any) => {
  const { email, password } = input

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    throw new Error('Invalid credentials')
  }

  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    plan: user.plan as 'FREE' | 'PRO'
  }

  const token = generateJWT(jwt, payload)

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan
    }
  }
}

export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      plan: true,
      createdAt: true,
      stripeId: true
    }
  })
}

export const verifyToken = (token: string, jwt: any): JWTPayload => {
  return verifyJWT(jwt, token)
}