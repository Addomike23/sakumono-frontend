import axiosClient, { axiosMultipart } from "./axiosClient";

export const patientsApi = {
  // Patient - Profile
  getProfile: () => axiosClient.get("/patients/profile"),
  updateProfile: (data) => axiosMultipart.put("/patients/profile", data), // ✅ FormData needs multipart, not JSON

  // Patient - Dashboard
  getDashboard: () => axiosClient.get("/patients/dashboard"),

  // Patient - Appointments
  getAppointments: (params) => axiosClient.get("/patients/appointments", { params }),

  // Patient - Medical Records
  getMedicalRecords: (params) => axiosClient.get("/patients/medical-records", { params }),
  getMedicalRecordById: (id) => axiosClient.get(`/patients/medical-records/${id}`),

  // Patient - Reviews
  getReviews: (params) => axiosClient.get("/patients/reviews", { params }),

  // Patient - Stats
  getStats: () => axiosClient.get("/patients/stats"),

  // ===============================
  // Admin Routes
  // ===============================
  getAllAdmin: (params) => axiosClient.get("/patients/admin/all", { params }),
  getByIdAdmin: (id) => axiosClient.get(`/patients/admin/${id}`),
  updateStatusAdmin: (id, isActive) =>
    axiosClient.put(`/patients/admin/${id}/status`, { isActive }),

  // ===============================
  // Admin - Patient CRUD
  // ===============================
  getById: (id) => axiosClient.get(`/patients/admin/${id}`),
  update: (id, data) => axiosMultipart.put(`/patients/admin/${id}`, data), // ✅ also accepts profileImage upload server-side
  delete: (id) => axiosClient.delete(`/patients/admin/${id}`),
  create: (data) => axiosClient.post("/patients/admin", data),
};