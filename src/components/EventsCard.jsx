// src/components/EventCards.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectTodayEvents, 
  selectTomorrowEvents,
  selectEvent,
  openEventModal
} from '../redux/eventSlice';

const EventCards = ({ isVisible, calendarData }) => {
  const dispatch = useDispatch();
  const todayEvents = useSelector(selectTodayEvents);
  const tomorrowEvents = useSelector(selectTomorrowEvents);
    console.log('todayEvents',todayEvents,'tomorrowEvetns',tomorrowEvents);
    console.log(calendarData);
  const handleEventClick = (event, dateKey) => {
    // Find the full event information to open in modal
    const fullEvent = calendarData[dateKey]?.events.find(e => e.id === event.id)?.fullEvent;
    if (fullEvent) {
      dispatch(selectEvent(fullEvent));
      dispatch(openEventModal());
    }
  };

  // Format today and tomorrow dates
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayFormatted = formatDate(today);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: { opacity: 0, y: 10 }
  };

  // Get the current date keys for today and tomorrow
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const tomorrowKey = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute left-full top-[80px] right-5 z-10 rounded-lg overflow-hidden shadow-lg w-72 bg-white border border-gray-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-sm font-medium text-gray-800">Upcoming Events</h3>
              <span className="text-xs text-gray-500">{todayFormatted}</span>
            </div>
            
            {/* Today's events */}
            <motion.div 
              variants={cardVariants}
              className="p-3 border-b border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Today</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'}
                </span>
              </div>
              
              {todayEvents.length === 0 ? (
                <div className="py-2 text-center ">
                  <p className="text-xs text-gray-500">No events scheduled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((event, index) => (
                    <motion.div
                      key={`today-${index}`}
                      className="p-2 bg-gradient-to-bl from-cyan-50 to-white drop-shadow-xs drop-shadow-black    rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEventClick(event, todayKey)}
                    >
                      <div className="flex items-start">
                        <div className="w-1 h-full py-2 mr-2">
                          <div className={`w-1 h-full rounded-full ${event.color === 'red' ? 'bg-gray-800' : (event.color === 'blue' ? 'bg-gray-600' : 'bg-gray-400')}`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-900">{event.time}</span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium mt-0.5 truncate">{event.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Tomorrow's events */}
            <motion.div 
              variants={cardVariants}
              className="p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Tomorrow</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {tomorrowEvents.length} {tomorrowEvents.length === 1 ? 'event' : 'events'}
                </span>
              </div>
              
              {tomorrowEvents.length === 0 ? (
                <div className="py-2 text-center">
                  <p className="text-xs text-gray-500">No events scheduled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tomorrowEvents.map((event, index) => (
                    <motion.div
                      key={`tomorrow-${index}`}
                      className="p-2  bg-gradient-to-bl from-cyan-50 to-white drop-shadow-xs drop-shadow-black  rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEventClick(event, tomorrowKey)}
                    >
                      <div className="flex items-start">
                        <div className="w-1 h-full py-2 mr-2">
                          <div className={`w-1 h-full rounded-full ${event.color === 'purple' ? 'bg-gray-800' : (event.color === 'blue' ? 'bg-gray-600' : 'bg-gray-400')}`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-xs font-medium text-gray-900">{event.time}</span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium mt-0.5 truncate">{event.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Footer with add event button */}
            <motion.div 
              variants={cardVariants}
              className="p-3 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50"
            >
              <button
                onClick={() => {
                  // Create empty event and open modal
                  const now = new Date();
                  const newEvent = {
                    title: "",
                    startDate: now,
                    endDate: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour later
                    description: "",
                    priority: "medium",
                    eventType: "meeting",
                    participants: []
                  };
                  dispatch(selectEvent(newEvent));
                  dispatch(openEventModal());
                }}
                className="w-full py-2 text-xs bg-gray-100 text-gray-700 font-medium rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventCards;
