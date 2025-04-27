// src/redux/ragSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../services/api';

// Async thunks for RAG operations
export const processQuery = createAsyncThunk(
  'rag/processQuery',
  async ({ query }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post('/ai/query', { message: query });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const generateEmbeddings = createAsyncThunk(
  'rag/generateEmbeddings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await baseApi.post('/rag/generate-embeddings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const generateEventEmbedding = createAsyncThunk(
  'rag/generateEventEmbedding',
  async ({ eventId }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post(`/rag/generate-embedding/${eventId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  queryResults: null,
  isProcessing: false,
  error: null,
  lastQuery: '',
  queryType: null,
  searchEvents: [],
  embeddingStatus: {
    isGenerating: false,
    lastGenerated: null,
    error: null
  }
};

// Create the RAG slice
const ragSlice = createSlice({
  name: 'rag',
  initialState,
  reducers: {
    clearQueryResults: (state) => {
      state.queryResults = null;
      state.searchEvents = [];
    },
    setLastQuery: (state, action) => {
      state.lastQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Process query
      .addCase(processQuery.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processQuery.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.queryResults = action.payload;
        state.queryType = action.payload.type || 'OTHER';
        
        // If it's a retrieval query with events, set the search events
        if (action.payload.type === 'EVENT_RETRIEVAL' && action.payload.events) {
          state.searchEvents = action.payload.events;
        } else {
          state.searchEvents = [];
        }
      })
      .addCase(processQuery.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to process query';
        state.searchEvents = [];
      })
      
      // Generate embeddings
      .addCase(generateEmbeddings.pending, (state) => {
        state.embeddingStatus.isGenerating = true;
        state.embeddingStatus.error = null;
      })
      .addCase(generateEmbeddings.fulfilled, (state, action) => {
        state.embeddingStatus.isGenerating = false;
        state.embeddingStatus.lastGenerated = new Date().toISOString();
      })
      .addCase(generateEmbeddings.rejected, (state, action) => {
        state.embeddingStatus.isGenerating = false;
        state.embeddingStatus.error = action.payload || 'Failed to generate embeddings';
      })
      
      // Generate event embedding
      .addCase(generateEventEmbedding.pending, (state) => {
        // No UI state changes needed for individual event embedding
      })
      .addCase(generateEventEmbedding.fulfilled, (state, action) => {
        // Could add the event ID to a list of "embedded events" if needed
      })
      .addCase(generateEventEmbedding.rejected, (state, action) => {
        // Could log errors for individual event embedding if needed
      });
  }
});

// Export actions
export const { clearQueryResults, setLastQuery } = ragSlice.actions;

// Export selectors
export const selectQueryResults = state => state.rag.queryResults;
export const selectIsProcessing = state => state.rag.isProcessing;
export const selectRagError = state => state.rag.error;
export const selectLastQuery = state => state.rag.lastQuery;
export const selectQueryType = state => state.rag.queryType;
export const selectSearchEvents = state => state.rag.searchEvents;
export const selectEmbeddingStatus = state => state.rag.embeddingStatus;

// Export reducer
export default ragSlice.reducer;
