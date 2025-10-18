import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, CreateApiKeyData, CreateApiKeyResponse, ApiKeysResponse } from '../api'

export const useApiKeys = () => {
  return useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => api.get<ApiKeysResponse>('/api/keys').then(res => res.data),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useCreateApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateApiKeyData) =>
      api.post<CreateApiKeyResponse>('/api/keys', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
    },
  })
}

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (apiKeyId: string) =>
      api.delete(`/api/keys/${apiKeyId}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
    },
  })
}

export const useGetDecryptedApiKey = () => {
  return useMutation({
    mutationFn: (apiKeyId: string) =>
      api.get(`/api/keys/${apiKeyId}/decrypt`).then(res => res.data),
  })
}
