import axiosClient from "./axiosClient";

export const notificationsApi = {
  getAll: (params) => axiosClient.get("/notifications", { params }),
  getUnreadCount: () => axiosClient.get("/notifications/unread-count"),
  getById: (id) => axiosClient.get(`/notifications/${id}`),
  markAsRead: (data) => axiosClient.put("/notifications/mark-read", data),
  delete: (id) => axiosClient.delete(`/notifications/${id}`),
  deleteAll: (params) => axiosClient.delete("/notifications", { params }),

  // Admin
  create: (data) => axiosClient.post("/notifications", data),
  sendBulk: (data) => axiosClient.post("/notifications/bulk", data),
  sendReminder: (data) => axiosClient.post("/notifications/reminder", data),
  getAllAdmin: (params) => axiosClient.get("/notifications/admin/all", { params }),
  getStats: () => axiosClient.get("/notifications/admin/stats"),
};
