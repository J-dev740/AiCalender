// src/hooks/useEventEmbeddings.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRagQuery } from './useRagQuery';

/**
 * Hook to automatically generate embeddings for events
 * This ensures that newly created or updated events are indexed for search
 */
const useEventEmbeddings = () => {
  const { generateEmbeddingForEvent } = useRagQuery();
  
  
  // Get most recently created/updated event
  const lastEvent = useSelector(state => {
    if (!state.events.items || state.events.items.length === 0) return null;
    
    // Find most recently modified event
    return state.events.items.reduce((latest, current) => {
      // Use createdAt or updatedAt timestamp
      const currentTimestamp = new Date(current.updatedAt || current.createdAt || 0).getTime();
      const latestTimestamp = new Date(latest.updatedAt || latest.createdAt || 0).getTime();
      return currentTimestamp > latestTimestamp ? current : latest;
    }, state.events.items[0]);
  });
  
  // Generate embedding when a new event is created or updated
  useEffect(() => {
    const processPendingEmbeddings = async () => {
      if (!lastEvent || !lastEvent._id) return;
      
      // Check if this event already has an embedding
      // We'll use localStorage to keep track of events that have embeddings
      const embedsKey = 'eventEmbeddings';
      const embeddedEvents = JSON.parse(localStorage.getItem(embedsKey) || '[]');
      
      // Add check for lastEvent.updatedAt to handle updates
      const timestamp = lastEvent.updatedAt || lastEvent.createdAt;
      const eventKey = `${lastEvent._id}-${timestamp}`;
      
      if (!embeddedEvents.includes(eventKey)) {
        try {
          // Generate embedding for this event
          await generateEmbeddingForEvent(lastEvent._id);
          
          // Track that we've embedded this event version
          localStorage.setItem(embedsKey, JSON.stringify([...embeddedEvents, eventKey]));
          
          console.log(`Generated embedding for event: ${lastEvent.title}`);
        } catch (error) {
          console.error('Failed to generate embedding:', error);
          // Non-critical failure, continue without embedding
        }
      }
    };
    
    processPendingEmbeddings();
  }, [lastEvent?._id, lastEvent?.updatedAt]);
  
  return null; // This hook doesn't return anything
};

export default useEventEmbeddings;