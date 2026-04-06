import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kaalikahani.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token from localStorage when available (fallback for cookie issues)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && accessToken !== 'undefined' && accessToken !== 'null' && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops on refresh endpoint
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Expired Access Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token via the refresh token cookie or localStorage
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        const useRefreshToken = refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null';
        if (!useRefreshToken) {
          return Promise.reject(error);
        }
        const refreshPayload = { refreshToken };
        const refreshRes = await api.post('/auth/refresh', refreshPayload);

        const newAccessToken = refreshRes?.data?.data?.accessToken;
        const newRefreshToken = refreshRes?.data?.data?.refreshToken;
        if (typeof window !== 'undefined') {
          if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // If successful, the server has set a new access token cookie
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed or expired -> Let useAuth handle it via state
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
