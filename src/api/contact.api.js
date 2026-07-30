import axiosClient from "./axiosClient";

export const contactApi = {
  send: (data) => axiosClient.post("/contact", data),

  // Admin
  getAll: (params) => axiosClient.get("/contact", { params }),
  getStats: () => axiosClient.get("/contact/stats"),
  getById: (id) => axiosClient.get(`/contact/${id}`),
  reply: (id, data) => axiosClient.post(`/contact/${id}/reply`, data),
  delete: (id) => axiosClient.delete(`/contact/${id}`),
};

export const subscriptionApi = {
  subscribe: (data) => axiosClient.post("/subscribe", data),
  verify: (token) => axiosClient.get(`/subscribe/verify/${token}`),
  unsubscribe: (email) => axiosClient.post("/subscribe/unsubscribe", { email }),

  // Admin
  getAll: (params) => axiosClient.get("/subscribe", { params }),
  getStats: () => axiosClient.get("/subscribe/stats"),
  bulkAdd: (subscribers) => axiosClient.post("/subscribe/bulk", { subscribers }),
};
