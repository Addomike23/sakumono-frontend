import axiosClient from "./axiosClient";

export const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  logout: () => axiosClient.post("/auth/logout"),
  getProfile: () => axiosClient.get("/auth/profile"),
  updateProfile: (data) => axiosClient.put("/auth/profile", data),
  changePassword: (data) => axiosClient.put("/auth/change-password", data),
  forgotPassword: (email) => axiosClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    axiosClient.post(`/auth/reset-password/${token}`, { password }),
  deleteAccount: () => axiosClient.delete("/auth/profile"),
  refreshToken: () => axiosClient.post("/auth/refresh-token"),

  // Admin
  getAllUsers: (params) => axiosClient.get("/auth/users", { params }),
  updateUserRole: (id, role) => axiosClient.put(`/auth/users/${id}/role`, { role }),
  deleteUser: (id) => axiosClient.delete(`/auth/users/${id}`),
};
