import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  id: string
  email: string
  plan: 'FREE' | 'PRO'
  createdAt: string
  stripeId?: string
}

export type Provider = 'CUSTOM' | 'SUPABASE' | 'IA'

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

export interface ApiKey {
  id: string
  name: string
  provider: Provider
  provider_config?: string  // JSON string of SupabaseConfig
  prefix: string
  last4: string
  revoked: boolean
  created_at: string
  updated_at: string
}

export interface CreateApiKeyResponse {
  api_key: string
  prefix: string
  last4: string
  name: string
  created_at: string
  provider?: Provider
  provider_config?: string  // JSON string of SupabaseConfig
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
  provider?: Provider
  provider_config?: SupabaseConfig  // Send as object, backend will stringify
}
