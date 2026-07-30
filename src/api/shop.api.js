import axiosClient, { axiosMultipart } from "./axiosClient";

export const shopApi = {
  // Products - Public
  getProducts: (params) => axiosClient.get("/shop/products", { params }),
  getFeatured: (limit) => axiosClient.get("/shop/products/featured", { params: { limit } }),
  getProductBySlug: (slug) => axiosClient.get(`/shop/products/${slug}`),
  getCategories: () => axiosClient.get("/shop/categories"),

  // Orders - Patient
  createOrder: (formData) => axiosMultipart.post("/shop/orders", formData),
  getMyOrders: (params) => axiosClient.get("/shop/orders", { params }),
  getOrderById: (id) => axiosClient.get(`/shop/orders/${id}`),

  // Admin - Products
  createProduct: (formData) => axiosMultipart.post("/shop/products", formData),
  getLowStock: () => axiosClient.get("/shop/products/admin/low-stock"),
  getProductStats: () => axiosClient.get("/shop/products/admin/stats"),
  getProductByIdAdmin: (id) => axiosClient.get(`/shop/products/admin/${id}`),
  updateProduct: (id, formData) => axiosMultipart.put(`/shop/products/${id}`, formData),
  deleteProduct: (id) => axiosClient.delete(`/shop/products/${id}`),

  // Admin - Orders
  getAllOrdersAdmin: (params) => axiosClient.get("/shop/orders/admin/all", { params }),
  updateOrderStatus: (id, data) => axiosClient.put(`/shop/orders/${id}/status`, data),
};