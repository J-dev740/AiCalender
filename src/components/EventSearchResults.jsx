// src/components/EventSearchResults.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { selectEvent, openEventModal } from '../redux/eventSlice';

/**
 * Component to display search results for events in the chat interface
 */
const EventSearchResults = ({ events }) => {
  const dispatch = useDispatch();

  if (!events || events.length === 0) {
    return null;
  }

  // Handle clicking on an event
  const handleEventClick = (event) => {
    dispatch(selectEvent(event));
    dispatch(openEventModal());
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        duration: 0.3
      }
    }
  };

  // Event type icons based on event type
  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'meeting':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'focus':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M6 17.657l.707.707" />
          </svg>
        );
      case 'break':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <motion.div 
      className="mt-2 mb-4 space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-xs text-gray-500 mb-1 font-medium">Found {events.length} events:</div>
      {events.map((event, index) => {
        // Prepare date and time strings
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        const dateStr = startDate.toLocaleDateString(undefined, { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
        const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        // Determine priority color
        const priorityColor = 
          event.priority === 'high' ? 'bg-red-100 text-red-800' :
          event.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800';

        return (
          <motion.div
            key={event._id || index}
            variants={itemVariants}
            className="p-2 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 cursor-pointer"
            onClick={() => handleEventClick(event)}
            whileHover={{ scale: 1.02, backgroundColor: "#EBF5FF" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="mr-1 text-gray-600">
                    {getEventTypeIcon(event.eventType)}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{event.title}</span>
                </div>
                <div className="flex items-center mt-1">
                  <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-600">{dateStr}</span>
                </div>
                <div className="flex items-center mt-0.5">
                  <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-600">{timeStr}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor}`}>
                  {event.priority}
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {event.eventType}
                </span>
              </div>
            </div>
            {event.description && (
              <p className="mt-1 text-xs text-gray-600 line-clamp-1">
                {event.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default EventSearchResults;