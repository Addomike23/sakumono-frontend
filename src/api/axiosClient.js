import axios from "axios";

// ============================================================
// DYNAMIC BASE URL DETECTION
// ============================================================

const getBaseURL = () => {
  // If running in production, use the production URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || "https://sakumono-backend.vercel.app/api";
  }
  
  // In development, detect if we're on mobile (accessing via network IP)
  const hostname = window.location.hostname;
  
  // If accessing via network IP (not localhost), use the network IP for API
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Use the same hostname but with port 8000 for API
    return `http://${hostname}:8000/api`;
  }
  
  // Default for local development
  return import.meta.env.VITE_API_URL || "http://localhost:8000/api";
};

// ============================================================
// USE PROXY (Recommended for mobile)
// ============================================================
// When using Vite proxy, set this to true to use relative URLs
// The proxy will forward /api requests to your backend
const USE_PROXY = true; // Set to true to use Vite's proxy

const getBaseURLWithProxy = () => {
  if (USE_PROXY) {
    // When using proxy, use relative URLs
    // Vite will proxy /api to http://localhost:8000/api
    return '/api';
  }
  return getBaseURL();
};

const BASE_URL = getBaseURLWithProxy();

console.log('📡 API Base URL:', BASE_URL);
console.log('🔧 Using Proxy:', USE_PROXY);

// ============================================================
// AXIOS CLIENT
// ============================================================

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach token and log requests
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sch_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If the data is FormData, let the browser set the Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  // Log request in development
  if (import.meta.env.DEV) {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data instanceof FormData ? 'FormData' : config.data,
    });
  }
  
  return config;
});

// Response interceptor - handle errors
axiosClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: status,
      message: message,
    });
    
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

// ============================================================
// MULTIPART CLIENT (for file uploads)
// ============================================================

export const axiosMultipart = axios.create({
  baseURL: BASE_URL,
  // No Content-Type header - browser will set it with boundary
});

axiosMultipart.interceptors.request.use((config) => {
  const token = localStorage.getItem("sch_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If the data is FormData, let the browser set the Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  if (import.meta.env.DEV) {
    console.log('📤 Multipart Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasFile: config.data instanceof FormData,
    });
  }
  
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