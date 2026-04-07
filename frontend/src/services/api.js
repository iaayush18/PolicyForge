/**
 * src/services/api.js
 * Migrated for Prisma/PostgreSQL & Aligned with new Controllers
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Standard JWT logic remains valid
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 401 handling is still critical for security
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTHENTICATION APIs
// ============================================================

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Note: Backend now returns user.id and uppercase Role (STUDENT/ADMIN)
    return response.data;
  },

verifyToken: async () => {
  const response = await api.get('/auth/verify');
  return response.data;
},
  

};

// ============================================================
// STUDENT APIs
// ============================================================

export const studentAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/students', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/students/profile/me');
    return response.data;
  },

  create: async (studentData) => {
    // Passwords are now hashed by the student service before Prisma create
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.patch(`/students/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    // This now triggers a Prisma Transaction (Assessments -> Student -> User)
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

// ASSESSMENT APIs

export const assessmentAPI = {
  submit: async (assessmentData) => {
    const response = await api.post('/assessments', assessmentData);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/assessments/my-history');
    return response.data;
  },

  getStudentHistory: async (studentId) => {
    const response = await api.get(`/assessments/student/${studentId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },
};

// DASHBOARD APIs

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getHighRisk: async () => {
    const response = await api.get('/dashboard/high-risk');
    return response.data;
  },

  getByCourse: async () => {
    const response = await api.get('/dashboard/by-course');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
};

export default api;