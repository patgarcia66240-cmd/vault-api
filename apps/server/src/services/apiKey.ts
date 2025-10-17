import { PrismaClient } from '@prisma/client'
import {
  generateAPIKey,
  hashAPIKey,
  extractAPIKeyInfo,
  encryptAPIKey,
  getMasterKey
} from '../libs/crypto'
import { CreateApiKeyInput } from '../schemas/apiKey'

const prisma = new PrismaClient()

export const createApiKey = async (userId: string, input: CreateApiKeyInput) => {
  const { name } = input

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.plan === 'FREE') {
    const activeKeysCount = await prisma.apiKey.count({
      where: {
        userId,
        revoked: false
      }
    })

    if (activeKeysCount >= 3) {
      throw new Error('Free plan limited to 3 API keys')
    }
  }

  const apiKey = generateAPIKey()
  const apiKeyHash = hashAPIKey(apiKey)
  const { prefix, last4 } = extractAPIKeyInfo(apiKey)

  const masterKey = getMasterKey()
  const encrypted = encryptAPIKey(apiKey, masterKey)

  await prisma.apiKey.create({
    data: {
      userId,
      name,
      prefix,
      last4,
      hash: apiKeyHash,
      encCiphertext: encrypted.ciphertext,
      encNonce: encrypted.nonce
    }
  })

  return {
    apiKey,
    prefix,
    last4,
    name,
    createdAt: new Date()
  }
}

export const getUserApiKeys = async (userId: string) => {
  return await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      prefix: true,
      last4: true,
      revoked: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const revokeApiKey = async (userId: string, apiKeyId: string) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: apiKeyId,
      userId
    }
  })

  if (!apiKey) {
    throw new Error('API key not found')
  }

  await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { revoked: true }
  })

  return { success: true }
}

export const validateApiKey = async (apiKeyHash: string) => {
  const apiKey = await prisma.apiKey.findUnique({
    where: { hash: apiKeyHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          plan: true
        }
      }
    }
  })

  if (!apiKey || apiKey.revoked) {
    return null
  }

  return {
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      last4: apiKey.last4
    },
    user: apiKey.user
  }
}