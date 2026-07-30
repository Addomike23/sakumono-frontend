import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://sakumono-backend.vercel.app/api";
// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sch_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global auth errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("sch_token");
      localStorage.removeItem("sch_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper for multipart/form-data requests (blogs, reviews, products, orders, profile uploads)
// NOTE: no default Content-Type header here — when you pass a FormData object,
// axios/the browser will automatically set the correct
// "multipart/form-data; boundary=..." header. Setting Content-Type manually
// on the instance (like axiosClient does for JSON) would strip the boundary
// and break file uploads.
export const axiosMultipart = axios.create({
  baseURL: BASE_URL,
});

axiosMultipart.interceptors.request.use((config) => {
  const token = localStorage.getItem("sch_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosMultipart.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("sch_token");
      localStorage.removeItem("sch_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;