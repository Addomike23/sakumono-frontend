import axios from "axios";

const BASE_URL =  "https://sakumono-backend.vercel.app/api";
// const BASE_URL = "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Required for CORS with credentials
  timeout: 30000, // ✅ Add timeout for better error handling
});

// Attach token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sch_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ✅ Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle global auth errors
axiosClient.interceptors.response.use(
  (response) => {
    // ✅ Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;
    
    // ✅ Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ [${error.config?.method?.toUpperCase()}] ${error.config?.url} - ${status}`, message);
    }
    
    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem("sch_token");
      localStorage.removeItem("sch_user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      console.error('Access forbidden:', message);
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      console.error('Resource not found:', message);
    }
    
    // Handle Network Errors
    if (!error.response) {
      console.error('Network error - please check your connection:', message);
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
  withCredentials: true, // ✅ Required for CORS with credentials
  timeout: 30000,
});

axiosMultipart.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sch_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ✅ Log multipart requests
    if (process.env.NODE_ENV === 'development') {
      console.log(`📎 [${config.method?.toUpperCase()}] ${config.url} - Multipart upload`);
    }
    return config;
  },
  (error) => {
    console.error('Multipart request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosMultipart.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ [${error.config?.method?.toUpperCase()}] ${error.config?.url} - ${status}`, message);
    }
    
    if (status === 401) {
      localStorage.removeItem("sch_token");
      localStorage.removeItem("sch_user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;