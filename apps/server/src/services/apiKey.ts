import { PrismaClient } from '@prisma/client'
import {
  generateAPIKey,
  hashAPIKey,
  extractAPIKeyInfo,
  encryptAPIKey,
  decryptAPIKey,
  getMasterKey
} from '../libs/crypto'
import { CreateApiKeyInput } from '../schemas/apiKey'

const prisma = new PrismaClient()

export const createApiKey = async (userId: string, input: CreateApiKeyInput) => {
  const { name, value, provider = 'CUSTOM', providerConfig } = input

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

  // Handle Supabase provider
  if (provider === 'SUPABASE') {
    if (!providerConfig) {
      throw new Error('Provider config is required for Supabase')
    }

    // Use anonKey as the main key value for hash/encryption
    const apiKey = providerConfig.anonKey
    const apiKeyHash = hashAPIKey(apiKey)
    const { prefix, last4 } = extractAPIKeyInfo(apiKey)

    await prisma.apiKey.create({
      data: {
        userId,
        name,
        provider,
        providerConfig: JSON.stringify(providerConfig),
        prefix,
        last4,
        hash: apiKeyHash,
        encCiphertext: Buffer.from([]),
        encNonce: Buffer.from([])
      }
    })

    return {
      apiKey: providerConfig.anonKey,
      prefix,
      last4,
      name,
      provider,
      providerConfig,
      createdAt: new Date()
    }
  }

  // Handle CUSTOM provider
  const apiKey = value || generateAPIKey()

  const apiKeyHash = hashAPIKey(apiKey)
  const { prefix, last4 } = extractAPIKeyInfo(apiKey)

  const masterKey = getMasterKey()
  const encrypted = encryptAPIKey(apiKey, masterKey)

  await prisma.apiKey.create({
    data: {
      userId,
      name,
      provider: 'CUSTOM',
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
    provider: 'CUSTOM',
    createdAt: new Date()
  }
}

export const getUserApiKeys = async (userId: string) => {
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return apiKeys.map(key => ({
    id: key.id,
    name: key.name,
    provider: key.provider,
    providerConfig: key.providerConfig ? JSON.parse(key.providerConfig) : undefined,
    prefix: key.prefix,
    last4: key.last4,
    revoked: key.revoked,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt
  }))
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

export const getDecryptedApiKey = async (userId: string, apiKeyId: string) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: apiKeyId,
      userId,
      revoked: false // Only allow decrypting active keys
    }
  })

  if (!apiKey) {
    throw new Error('API key not found')
  }

  const masterKey = getMasterKey()
  const encrypted = {
    ciphertext: apiKey.encCiphertext,
    nonce: apiKey.encNonce
  }

  const decryptedKey = decryptAPIKey(encrypted, masterKey)

  return {
    apiKey: decryptedKey,
    name: apiKey.name,
    prefix: apiKey.prefix,
    last4: apiKey.last4
  }
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
