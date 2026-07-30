import axiosClient from './axiosClient'

export const medicalRecordsApi = {
  // Patient
  getMine: (params) => axiosClient.get('/patients/medical-records', { params }),
  getById: (id) => axiosClient.get(`/patients/medical-records/${id}`),
  
  // Doctor
  create: (data) => axiosClient.post('/medical-records', data),
  update: (id, data) => axiosClient.put(`/medical-records/${id}`, data),
  
  // Admin
  getAll: (params) => axiosClient.get('/medical-records', { params }),
  delete: (id) => axiosClient.delete(`/medical-records/${id}`),
}