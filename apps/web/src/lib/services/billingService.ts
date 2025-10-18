import { api } from '../api'

export const createCheckoutSession = async () => {
  const response = await api.post('/api/billing/checkout')
  return response.data
}

export const getUserInvoices = async () => {
  const response = await api.get('/api/billing/invoices')
  return response.data
}
