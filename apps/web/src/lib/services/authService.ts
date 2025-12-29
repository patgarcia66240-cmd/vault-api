import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
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
      // Store JWT token in localStorage
      localStorage.setItem('token', data.access_token)
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
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/auth/me')
        return res.data.user as User
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
