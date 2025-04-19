// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Clerk authentication token to requests
api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventApi = {
  getEvents: () => api.get('/events'),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.patch(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

export const aiApi = {
  processSchedulingRequest: (message) => api.post('/ai/schedule', { message }),
};

export const subscriptionApi = {
  getStatus: () => api.get('/subscriptions/status'),
  createCheckoutSession: (priceId, plan) => 
    api.post('/subscriptions/create-checkout-session', { priceId, plan }),
};

export default api;