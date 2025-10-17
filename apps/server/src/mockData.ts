interface User {
  id: string
  email: string
  passwordHash: string
  plan: string
  stripeId?: string
  createdAt: string
  updatedAt: string
}

interface ApiKey {
  id: string
  userId: string
  name: string
  prefix: string
  last4: string
  encCiphertext: Buffer
  encNonce: Buffer
  hash: string
  revoked: boolean
  createdAt: string
  updatedAt: string
}

// Mock data storage
let users: User[] = []
let apiKeys: ApiKey[] = []

// Sample user for testing
const sampleUser: User = {
  id: '1',
  email: 'test@example.com',
  passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // 'password123'
  plan: 'FREE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

users.push(sampleUser)

export const mockDb = {
  users,
  apiKeys
}