import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kaalikahani.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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
        // Attempt to refresh the access token via the refresh token cookie
        await api.post('/auth/refresh');
        
        // If successful, the server has set a new access token cookie
        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed or expired -> Force Logout
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          // Guard: Do not redirect if we are already on an auth page or if the current path is /login
          if (!path.startsWith('/login') && !path.startsWith('/register')) {
             window.location.href = '/login?expired=true';
          }
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
