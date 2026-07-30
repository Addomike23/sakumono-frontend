import axiosClient from "./axiosClient";

export const reviewsApi = {
  // Public routes
  getAll: (params) => axiosClient.get("/reviews", { params }),
  getStats: () => axiosClient.get("/reviews/stats"),
  getDoctorReviews: (doctorId, params) => {
    
    if (!doctorId) {
      
      return Promise.resolve({ data: { reviews: [], stats: { averageRating: 0, totalReviews: 0, ratingDistribution: {} } } });
    }
    return axiosClient.get(`/reviews/doctor/${doctorId}`, { params });
  },
  getById: (id) => axiosClient.get(`/reviews/${id}`),
  create: (data) => axiosClient.post("/reviews", data),

  // Admin routes
  update: (id, data) => axiosClient.put(`/reviews/${id}`, data),
  delete: (id) => axiosClient.delete(`/reviews/${id}`),
  
  // Patient specific - get patient's own reviews
  getMyReviews: (params) => axiosClient.get("/reviews/patient", { params }),
};