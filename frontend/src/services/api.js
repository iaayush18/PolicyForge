/**
 * src/services/api.js
 * Centralized API Service with Axios
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
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
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      userId,
      currentPassword,
      newPassword,
    });
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
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.patch(`/students/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

// ============================================================
// ASSESSMENT APIs
// ============================================================

export const assessmentAPI = {
  submit: async (assessmentData) => {
    const response = await api.post('/assessments', assessmentData);
    return response.data;
  },

  getStudentHistory: async (studentId) => {
    const response = await api.get(`/assessments/student/${studentId}`);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/assessments/my-history');
    return response.data;
  },

  getCritical: async () => {
    const response = await api.get('/assessments/critical');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assessments/${id}`);
    return response.data;
  },
};

// ============================================================
// DASHBOARD APIs
// ============================================================

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

  getTrends: async (days = 30) => {
    const response = await api.get('/dashboard/trends', { params: { days } });
    return response.data;
  },

  getGenderStats: async () => {
    const response = await api.get('/dashboard/gender-stats');
    return response.data;
  },

  getCGPACorrelation: async () => {
    const response = await api.get('/dashboard/cgpa-correlation');
    return response.data;
  },

  getRecentAssessments: async (limit = 20) => {
    const response = await api.get('/dashboard/recent-assessments', {
      params: { limit },
    });
    return response.data;
  },
};

export default api;