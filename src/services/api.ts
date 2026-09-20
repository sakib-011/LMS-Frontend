import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Smart API Base URL:
// - In production (Vercel deployment): Defaults to live Render URL
// - In development (npm run dev): Defaults to local Spring Boot URL (http://localhost:9292/api/v1)
// - Can always be overridden by VITE_API_BASE_URL in .env or Vercel settings
const DEFAULT_URL = import.meta.env.DEV
  ? 'http://localhost:9292/api/v1'
  : 'https://lms-backend-ggmm.onrender.com/api/v1';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds to handle Render free-tier cold starts
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
