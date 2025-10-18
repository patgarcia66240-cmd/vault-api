import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface User {
  id: string
  email: string
  plan: 'FREE' | 'PRO'
  createdAt: string
  stripeId?: string
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  last4: string
  revoked: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateApiKeyResponse {
  apiKey: string
  prefix: string
  last4: string
  name: string
  createdAt: string
}

export interface ApiKeysResponse {
  apiKeys: ApiKey[]
}

export interface SignupData {
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface CreateApiKeyData {
  name: string
  value?: string
}
