import axiosClient from "./axiosClient";

export const subscriptionApi = {
  // Public
  subscribe: (data) => axiosClient.post("/subscribe", data),
  verify: (token) => axiosClient.get(`/subscribe/verify/${token}`),
  unsubscribe: (email) => axiosClient.post("/subscribe/unsubscribe", { email }),

  // Admin
  getAll: (params) => axiosClient.get("/subscribe", { params }),
  getStats: () => axiosClient.get("/subscribe/stats"),
  bulkAdd: (subscribers) => axiosClient.post("/subscribe/bulk", { subscribers }),
};