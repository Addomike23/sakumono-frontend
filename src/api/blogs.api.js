import axiosClient, { axiosMultipart } from "./axiosClient";

export const blogsApi = {
  getAll: (params) => axiosClient.get("/blogs", { params }),
  getRecent: (limit) => axiosClient.get("/blogs/recent", { params: { limit } }),
  getPopular: (limit) => axiosClient.get("/blogs/popular", { params: { limit } }),
  getCategories: () => axiosClient.get("/blogs/categories"),
  getByCategory: (category, params) =>
    axiosClient.get(`/blogs/category/${category}`, { params }),
  getBySlug: (slug) => axiosClient.get(`/blogs/${slug}`),
  toggleLike: (id) => axiosClient.post(`/blogs/${id}/like`),

  create: (formData) => axiosMultipart.post("/blogs", formData),

  // Admin/author
  getAllAdmin: (params) => axiosClient.get("/blogs/admin/all", { params }),
  getStats: () => axiosClient.get("/blogs/admin/stats"),
  getByIdAdmin: (id) => axiosClient.get(`/blogs/admin/${id}`),
  update: (id, formData) => axiosMultipart.put(`/blogs/admin/${id}`, formData),
  delete: (id) => axiosClient.delete(`/blogs/admin/${id}`),
};
