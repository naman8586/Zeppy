// ============================================
// FILE: src/lib/api.js
// Tactical API Client with Enhanced Error Handling
// ============================================
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('zappy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Elegant Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'A digital glitch occurred.';
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      Cookies.remove('zappy_token');
      Cookies.remove('zappy_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=session_expired';
      }
    }
    
    // Return custom error object
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
  create: (data) => api.post('/events', data),
  getVendorEvents: (status) => 
    api.get('/events/vendor', { params: status ? { status } : {} }),
  getEventDetails: (id) => api.get(`/events/${id}`),
  checkIn: (data) => api.post('/events/check-in', data),
  uploadProgress: (data) => api.post('/events/progress', data),
};

// ============================================
// OTP API
// ============================================
export const otpAPI = {
  generate: (data) => api.post('/otp/generate', data),
  verify: (data) => api.post('/otp/verify', data),
  getStatus: (eventId, otpType) => 
    api.get('/otp/status', { params: { eventId, otpType } }),
};

// ============================================
// MEDIA API with Progress Tracking
// ============================================
export const mediaAPI = {
  uploadCheckIn: (formData, onProgress) => {
    return api.post('/media/upload/check-in', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  uploadProgress: (formData, onProgress) => {
    return api.post('/media/upload/progress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

export default api;