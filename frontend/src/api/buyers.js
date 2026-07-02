import api from './client'

export const createBuyer = (payload) => api.post('/buyer', payload).then((response) => response.data)
export const loginBuyer = (payload) => api.post('/buyer/login', payload).then((response) => response.data)
export const getBuyers = () => api.get('/buyers').then((response) => response.data)
export const getBuyer = (buyerId) => api.get(`/buyer/${buyerId}`).then((response) => response.data)
export const updateBuyer = (buyerId, payload) => api.put(`/buyer/${buyerId}`, payload).then((response) => response.data)
export const approveBuyer = (buyerId) => api.post(`/buyer/${buyerId}/approve`).then((response) => response.data)
export const deleteBuyer = (buyerId) => api.delete(`/buyer/${buyerId}`)
