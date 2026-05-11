/**
 * src/services/api.js
 * Campus Wellness Platform — API Layer
 */

import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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

// ── AUTH ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// ── STUDENTS ──────────────────────────────────────────────────────────────
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

// ── WELLNESS ASSESSMENTS (new) ─────────────────────────────────────────────
export const wellnessAPI = {
  submit: async ({ sectionAnswers, notes }) => {
    const response = await api.post('/wellness', { sectionAnswers, notes });
    return response.data;
  },
  getMyHistory: async () => {
    const response = await api.get('/wellness/my-history');
    return response.data;
  },
  getStudentHistory: async (studentId) => {
    const response = await api.get(`/wellness/student/${studentId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/wellness/${id}`);
    return response.data;
  },
};

// ── SUPPORT TICKETS (new) ─────────────────────────────────────────────────
export const supportAPI = {
  create: async ({ type, message, priority, isAnonymous }) => {
    const response = await api.post('/support', { type, message, priority, isAnonymous });
    return response.data;
  },
  getMyTickets: async () => {
    const response = await api.get('/support/my-tickets');
    return response.data;
  },
  getAll: async (filters = {}) => {
    const response = await api.get('/support', { params: filters });
    return response.data;
  },
  updateStatus: async (id, { status, adminNotes }) => {
    const response = await api.patch(`/support/${id}`, { status, adminNotes });
    return response.data;
  },
  getPendingCount: async () => {
    const response = await api.get('/support/pending-count');
    return response.data;
  },
};

// ── LEGACY ASSESSMENT API (kept for compatibility) ─────────────────────────
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

// ── DASHBOARD ─────────────────────────────────────────────────────────────
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
  getDomainAverages: async () => {
    const response = await api.get('/dashboard/domain-averages');
    return response.data;
  },
};

export default api;
