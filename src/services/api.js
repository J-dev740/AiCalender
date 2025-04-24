// src/services/api.js
import axios from 'axios';
import store from '../redux/store';
import { openAuthModal } from '../redux/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const getClerk = () => window.Clerk;

// Create a base axios instance without auth
const createBaseApi = () => {
  return axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
      },
  });
};

// Export the base API for non-authenticated requests
export const baseApi = createBaseApi();

// Create a hook to get an authenticated API instance
// This must be used within React components
export const useApiAuth = (getToken) => {
  const api = createBaseApi();
  
  // Add token to requests
  api.interceptors.request.use(async (config) => {
    try {
      if (getToken) {
        const token = await getToken({skipCache: true});
        console.log('token--------->', { token });
        if (!token) {
          throw new Error('No auth token available');
        }
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      return Promise.reject(error);
    }
    console.log('config', { config });
    return config;
  });
  api.interceptors.response.use(
    async(response) => {
      return response;
    },
    async (error)=>{
        if (error.response && error.response.status === 401) {
            const clerk = getClerk();
            if (clerk) {
              try {
                // Sign out the user with Clerk
                await clerk.signOut();
                
                // Dispatch Redux action to update the store
                store.dispatch(logoutUser());
                
                // Open auth modal for re-login
                store.dispatch(openAuthModal());
              } catch (signOutError) {
                console.error('Error signing out with Clerk:', signOutError);
              }
            } else {
              // Fallback if Clerk is not available
            //   console.error('Clerk not available');
            //   store.dispatch(openAuthModal());
            }
          }
    }
  );
  
  return {
    // Event APIs
    eventApi: {
      getEvents: async () => api.get('/events'),
      createEvent: async (eventData) => api.post('/events', eventData),
      updateEvent: async (id, eventData) => api.patch(`/events/${id}`, eventData),
      deleteEvent: async (id) => api.delete(`/events/${id}`),
    },
    
    // AI APIs
    aiApi: {
      processSchedulingRequest: async(message) => api.post('/ai/schedule', { message }),
    },
    
    // Subscription APIs
    subscriptionApi: {
      getStatus: async() => api.get('/subscriptions/status'),
      createCheckoutSession: async(priceId, plan) => 
        api.post('/subscriptions/create-checkout-session', { priceId, plan }),
    },
    userApi:{
      checkOrCreateUser: async(data) => api.post('/users/check-or-create',{...data}),
    }
  };
};