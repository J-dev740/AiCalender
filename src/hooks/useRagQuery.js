// src/hooks/useRagQuery.js
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  processQuery, 
  generateEmbeddings,
  generateEventEmbedding,
  selectQueryResults,
  selectIsProcessing,
  selectRagError,
  selectQueryType,
  selectSearchEvents,
  clearQueryResults
} from '../redux/ragSlice';

/**
 * Custom hook for RAG query functionality
 */
export const useRagQuery = () => {
  const dispatch = useDispatch();
  
  // Select state from store
  const queryResults = useSelector(selectQueryResults);
  const isProcessing = useSelector(selectIsProcessing);
  const error = useSelector(selectRagError);
  const queryType = useSelector(selectQueryType);
  const searchEvents = useSelector(selectSearchEvents);
  
  // Initialize embeddings
  useEffect(() => {
    const initializeEmbeddings = async () => {
      try {
        // Check if embeddings were recently initialized
        const lastInit = localStorage.getItem('embeddingsLastInit');
        const shouldInit = !lastInit || (Date.now() - parseInt(lastInit)) > 86400000; // 24 hours
        
        if (shouldInit) {
          await dispatch(generateEmbeddings()).unwrap();
          localStorage.setItem('embeddingsLastInit', Date.now().toString());
        }
      } catch (error) {
        console.error('Error initializing embeddings:', error);
        // Non-critical error, continue without embeddings
      }
    };
    
    initializeEmbeddings();
  }, []);
  
  /**
   * Submit a query for processing
   * @param {string} queryText - The query text to process
   * @returns {Promise} - Result of the query processing
   */
  const submitQuery = async (queryText) => {
    try {
      const result = await dispatch(processQuery({ query: queryText })).unwrap();
      return result;
    } catch (error) {
      console.error('Error submitting query:', error);
      throw error;
    }
  };
  
  /**
   * Generate embedding for a specific event
   * @param {string} eventId - ID of the event
   */
  const generateEmbeddingForEvent = async (eventId) => {
    try {
      await dispatch(generateEventEmbedding({ eventId })).unwrap();
    } catch (error) {
      console.error('Error generating event embedding:', error);
      // Non-critical error, continue without embedding
    }
  };
  
  /**
   * Clear the current query results
   */
  const clearResults = () => {
    dispatch(clearQueryResults());
  };
  
  return {
    // State
    queryResults,
    isProcessing,
    error,
    queryType,
    searchEvents,
    
    // Actions
    submitQuery,
    generateEmbeddingForEvent,
    clearResults
  };
};

export default useRagQuery;