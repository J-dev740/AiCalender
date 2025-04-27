import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../services/api';

// Async thunks for API operations
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Using baseApi from api.js
      const response = await baseApi.get('/events');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      // Using baseApi from api.js
      const response = await baseApi.post('/events', eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      // Using baseApi from api.js
      const response = await baseApi.patch(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      // Using baseApi from api.js
      await baseApi.delete(`/events/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    todayEvents: [],
    tomorrowEvents: [],
    calendarData: {},
    loading: false,
    error: null,
    selectedEvent: null,
    isModalOpen: false
  },
  reducers: {
    selectEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    openEventModal: (state) => {
      state.isModalOpen = true;
    },
    closeEventModal: (state) => {
      state.isModalOpen = false;
      state.selectedEvent = null;
    },
    clearEventError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        console.log('action.payload',action.payload);
        
        // Process events for today and tomorrow views
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        state.todayEvents = action.payload
          .filter(event => new Date(event.startDate).toDateString() === today.toDateString())
          .map(event => ({
            id: event._id,
            time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: event.title,
            color: event.priority === 'high' ? 'red' : event.priority === 'medium' ? 'blue' : 'green'
          }));
          
        state.tomorrowEvents = action.payload
          .filter(event => new Date(event.startDate).toDateString() === tomorrow.toDateString())
          .map(event => ({
            id: event._id,
            time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: event.title,
            color: event.priority === 'high' ? 'purple' : event.priority === 'medium' ? 'blue' : 'green'
          }));
          
        // Process calendar data
        const calData = {};
        action.payload.forEach(event => {
          const eventDate = new Date(event.startDate);
          const year = eventDate.getFullYear();
          const month = eventDate.getMonth() + 1;
          const day = eventDate.getDate();
          
          const dateKey = `${year}-${month}-${day}`;
          
          if (!calData[dateKey]) {
            calData[dateKey] = {
              count: 0,
              events: []
            };
          }
          
          calData[dateKey].count += 1;
          calData[dateKey].events.push({
            id: event._id,
            time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: event.title,
            note: event.description || "No description provided",
            organizer: "You",
            // Store full event data for editing
            fullEvent: event
          });
        });
        
        state.calendarData = calData;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        
        // Update today/tomorrow events if applicable
        const eventDate = new Date(action.payload.startDate);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        const eventFormatted = {
          id: action.payload._id,
          time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: action.payload.title,
          color: action.payload.priority === 'high' ? 'red' : action.payload.priority === 'medium' ? 'blue' : 'green'
        };
        
        if (eventDate.toDateString() === today.toDateString()) {
          state.todayEvents.push(eventFormatted);
        } else if (eventDate.toDateString() === tomorrow.toDateString()) {
          state.tomorrowEvents.push({
            ...eventFormatted,
            color: action.payload.priority === 'high' ? 'purple' : action.payload.priority === 'medium' ? 'blue' : 'green'
          });
        }
        
        // Update calendar data
        const year = eventDate.getFullYear();
        const month = eventDate.getMonth() + 1;
        const day = eventDate.getDate();
        const dateKey = `${year}-${month}-${day}`;
        
        if (!state.calendarData[dateKey]) {
          state.calendarData[dateKey] = {
            count: 0,
            events: []
          };
        }
        
        state.calendarData[dateKey].count += 1;
        state.calendarData[dateKey].events.push({
          id: action.payload._id,
          time: eventFormatted.time,
          title: action.payload.title,
          note: action.payload.description || "No description provided",
          organizer: "You",
          fullEvent: action.payload
        });
        state.selectedEvent = null;
        state.isModalOpen = false;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the event in items array
        const index = state.items.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        
        // Update today/tomorrow events
        const eventDate = new Date(action.payload.startDate);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        const eventFormatted = {
          id: action.payload._id,
          time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: action.payload.title,
          color: action.payload.priority === 'high' ? 'red' : action.payload.priority === 'medium' ? 'blue' : 'green'
        };
        
        // Remove from both arrays first
        state.todayEvents = state.todayEvents.filter(event => event.id !== action.payload._id);
        state.tomorrowEvents = state.tomorrowEvents.filter(event => event.id !== action.payload._id);
        
        // Then add to the appropriate array
        if (eventDate.toDateString() === today.toDateString()) {
          state.todayEvents.push(eventFormatted);
        } else if (eventDate.toDateString() === tomorrow.toDateString()) {
          state.tomorrowEvents.push({
            ...eventFormatted,
            color: action.payload.priority === 'high' ? 'purple' : action.payload.priority === 'medium' ? 'blue' : 'green'
          });
        }
        
        // Update calendar data
        // First, search for the event in all date keys to remove it
        Object.keys(state.calendarData).forEach(dateKey => {
          state.calendarData[dateKey].events = state.calendarData[dateKey].events.filter(event => event.id !== action.payload._id);
          state.calendarData[dateKey].count = state.calendarData[dateKey].events.length;
          
          // Remove empty dates
          if (state.calendarData[dateKey].count === 0) {
            delete state.calendarData[dateKey];
          }
        });
        
        // Add the updated event to the correct date
        const year = eventDate.getFullYear();
        const month = eventDate.getMonth() + 1;
        const day = eventDate.getDate();
        const dateKey = `${year}-${month}-${day}`;
        
        if (!state.calendarData[dateKey]) {
          state.calendarData[dateKey] = {
            count: 0,
            events: []
          };
        }
        
        state.calendarData[dateKey].count += 1;
        state.calendarData[dateKey].events.push({
          id: action.payload._id,
          time: eventFormatted.time,
          title: action.payload.title,
          note: action.payload.description || "No description provided",
          organizer: "You",
          fullEvent: action.payload
        });
        
        // Reset selected event and close modal
        state.selectedEvent = null;
        state.isModalOpen = false;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove from items array
        state.items = state.items.filter(event => event._id !== action.payload);
        
        // Remove from today/tomorrow arrays
        state.todayEvents = state.todayEvents.filter(event => event.id !== action.payload);
        state.tomorrowEvents = state.tomorrowEvents.filter(event => event.id !== action.payload);
        
        // Remove from calendar data
        Object.keys(state.calendarData).forEach(dateKey => {
          state.calendarData[dateKey].events = state.calendarData[dateKey].events.filter(event => event.id !== action.payload);
          state.calendarData[dateKey].count = state.calendarData[dateKey].events.length;
          
          // Remove empty dates
          if (state.calendarData[dateKey].count === 0) {
            delete state.calendarData[dateKey];
          }
        });
        
        // Reset selected event and close modal
        state.selectedEvent = null;
        state.isModalOpen = false;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { selectEvent, openEventModal, closeEventModal, clearEventError } = eventsSlice.actions;

export const selectEvents = state => state.events.items;
export const selectTodayEvents = state => state.events.todayEvents;
export const selectTomorrowEvents = state => state.events.tomorrowEvents;
export const selectCalendarData = state => state.events.calendarData;
export const selectSelectedEvent = state => state.events.selectedEvent;
export const selectIsEventModalOpen = state => state.events.isModalOpen;
export const selectEventsLoading = state => state.events.loading;
export const selectEventsError = state => state.events.error;

export default eventsSlice.reducer;