import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===================== Auth API =====================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
}

// ===================== Articles API =====================
export const articlesAPI = {
  getAll: (params) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`),
  
  // AI enhancements
  enhanceWithAI: (articleId) => api.post(`/ai/enhance-article/${articleId}`),
  translate: (articleId, targetLang) => api.post(`/ai/translate`, { article_id: articleId, target_language: targetLang }),
  schedulePublish: (data) => api.post('/ai/schedule-publish', data),
}

// ===================== Comments API =====================
export const commentsAPI = {
  getAll: (params) => api.get('/comments', { params }),
  getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
}

// ===================== Analytics API =====================
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getArticleStats: (articleId) => api.get(`/analytics/article/${articleId}`),
  trackEvent: (data) => api.post('/analytics/track', data),
}

// ===================== AI API =====================
export const aiAPI = {
  chat: (data) => api.post('/chatbot/chat', data),
  getRecommendations: (userId, limit) => api.get(`/ai/recommendations`, { params: { user_id: userId, limit } }),
}

// ===================== Users API =====================
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export default api
