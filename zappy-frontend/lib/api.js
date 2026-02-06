// ============================================
// FILE: src/lib/api.js
// Stable API Client (Next.js App Router Safe)
// ============================================
import axios from 'axios';
import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/* ======================================================
   REQUEST INTERCEPTOR
   - Use in-memory auth cache (NOT Cookies directly)
====================================================== */
api.interceptors.request.use(
  (config) => {
    const token = auth.getToken(); // ✅ stable, cached
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
   RESPONSE INTERCEPTOR
   - NO infinite logout loops
   - Only logout when truly necessary
====================================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || 'A digital glitch occurred.';

    // ⚠️ Handle 401 safely
    if (
      status === 401 &&
      typeof window !== 'undefined'
    ) {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith('/login') || path.startsWith('/register');

      // Only force logout if user is on a protected page
      if (!isAuthPage && auth.isAuthenticated()) {
        console.warn('[AUTH] Session invalid → logging out');
        auth.logout(); // ✅ single source of truth
      }
    }

    return Promise.reject({
      message,
      status,
      data: error.response?.data,
    });
  }
);

/* ======================================================
   AUTH API
====================================================== */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

/* ======================================================
   EVENTS API
====================================================== */
export const eventsAPI = {
  create: (data) => api.post('/events', data),
  getVendorEvents: (status) =>
    api.get('/events/vendor', { params: status ? { status } : {} }),
  getEventDetails: (id) => api.get(`/events/${id}`),
  checkIn: (data) => api.post('/events/check-in', data),
  uploadProgress: (data) => api.post('/events/progress', data),
};

/* ======================================================
   OTP API
====================================================== */
export const otpAPI = {
  generate: (data) => api.post('/otp/generate', data),
  verify: (data) => api.post('/otp/verify', data),
  getStatus: (eventId, otpType) =>
    api.get('/otp/status', { params: { eventId, otpType } }),
};

/* ======================================================
   MEDIA API
====================================================== */
export const mediaAPI = {
  uploadCheckIn: (formData, onProgress) =>
    api.post('/media/upload/check-in', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }),

  uploadProgress: (formData, onProgress) =>
    api.post('/media/upload/progress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }),
};

export default api;
