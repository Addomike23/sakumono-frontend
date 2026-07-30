import axiosClient from "./axiosClient";

export const doctorsApi = {
  getAll: (params) => axiosClient.get("/doctors", { params }),
  getTop: (limit) => axiosClient.get("/doctors/top", { params: { limit } }),
  getSpecializations: () => axiosClient.get("/doctors/specializations"),
  getAvailability: (doctorId) =>
    axiosClient.get("/doctors/availability", { params: { doctorId } }),
  getById: (id) => axiosClient.get(`/doctors/${id}`),

  // Doctor's own profile
  getMyProfile: () => axiosClient.get("/doctors/profile"),
  updateMyProfile: (data) => axiosClient.put("/doctors/profile", data),
  updateMyAvailability: (availability) =>
    axiosClient.put("/doctors/availability", { availability }),
  getMyStats: () => axiosClient.get("/doctors/stats"),
  updateFee: (fee) => axiosClient.put("/doctors/fee", { fee }),

  // Admin
  getAllAdmin: (params) => axiosClient.get("/doctors/admin/all", { params }),
  updateStatus: (id, isAvailableForConsultation) =>
    axiosClient.put(`/doctors/${id}/status`, { isAvailableForConsultation }),
};
