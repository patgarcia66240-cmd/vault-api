import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, User, SignupData, LoginData } from '../api'

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupData) =>
      api.post('/api/auth/signup', data).then(res => res.data),
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginData) =>
      api.post('/api/auth/login', data).then(res => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      api.post('/api/auth/logout').then(res => res.data),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/api/auth/me').then(res => res.data.user),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}