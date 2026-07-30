import axiosClient from "./axiosClient";

export const appointmentsApi = {
  getAvailability: (doctorId, date) =>
    axiosClient.get("/appointments/availability", { params: { doctorId, date } }),
  create: (data) => axiosClient.post("/appointments", data),
  getMine: (params) => axiosClient.get("/appointments/patient", { params }),
  getForDoctor: (params) => axiosClient.get("/appointments/doctor", { params }),
  getStats: () => axiosClient.get("/appointments/stats"),
  getAllAdmin: (params) => axiosClient.get("/appointments/admin", { params }),
  getById: (id) => axiosClient.get(`/appointments/${id}`),
 // In appointments.api.js
update: (id, data) => {
  return axiosClient.put(`/appointments/${id}`, data);
},
  cancel: (id, reason) => axiosClient.put(`/appointments/${id}/cancel`, { reason }),
  reschedule: (id, data) => axiosClient.put(`/appointments/${id}/reschedule`, data),
};
