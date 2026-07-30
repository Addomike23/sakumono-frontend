import axiosClient from './axiosClient'

export const usersApi = {
  // Admin
  getAll: (params) => axiosClient.get('/auth/users', { params }),
  getById: (id) => axiosClient.get(`/auth/users/${id}`),
  updateRole: (id, role) => axiosClient.put(`/auth/users/${id}/role`, { role }),
  updateStatus: (id, data) => axiosClient.put(`/auth/users/${id}/status`, data),
  delete: (id) => axiosClient.delete(`/auth/users/${id}`),
}