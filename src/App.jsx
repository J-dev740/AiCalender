import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, eventApi,subscriptionApi } from './services/api';
import { useUser } from '@clerk/clerk-react';
import { SignIn,SignUp } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MonthSelector from "./components/monthSelector";
import YearSelector from "./components/yearSelector";
import AuthWrapper from "./components/AuthWrapper";

const MainCalendar = () => {
  // State management
  const [viewMode, setViewMode] = useState("schedule"); // "schedule" or "calendar"
  const [activeCard, setActiveCard] = useState(null);
  const [toggle,setToggle]=useState(true);
  const [chatInput, setChatInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prompt, setPrompt] = useState("");
  const [direction, setDirection] = useState(0); // 1 for up (next month), -1 for down (prev month)
  const [swipeDirection, setSwipeDirection] = useState("left");
  const [swipeAnimating, setSwipeAnimating] = useState(false);
  const [scrollingMonth, setScrollingMonth] = useState(false);
  const [scrollingYear, setScrollingYear] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [suggestedTimes, setSuggestedTimes] = useState([
    "2:00 PM - Meeting",
    "4:30 PM - Coffee Break",
  ]);
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Welcome to CalBuddy! How can I help with your schedule today?' },
    { type: 'user', text: 'I need to schedule a team meeting next week' },
    { type: 'ai', text: 'Great! I can help with that. When would you prefer to have the meeting, and how long should it be?' }
  ]);
  const [currentEventData,setCurrentEventData]=useState(null);

  // Sample events
  const [events, setEvents] = useState({
    tomorrow: [],
    today: []
  });
  
  // Inside your App component
  const { user, isLoaded, isSignedIn } = useUser();
  const [subscription, setSubscription] = useState({ status: 'free' });
  // Calendar data
  const [calendarData, setCalendarData] = useState(() => {
    const data = {};
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
  
    // Generate some sample events for the current month
    for (let i = 1; i <= 28; i++) {
      const eventsCount = Math.floor(Math.random() * 5); // 0-4 events per day
      if (eventsCount > 0) {
        data[`${currentYear}-${currentMonth+1}-${i}`] = {
          count: eventsCount,
          events: Array(eventsCount).fill(0).map((_, idx) => ({
            id: `event-${i}-${idx}`,
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            title: ["Team Meeting", "Coffee Break", "Client Call", "Focus Time", "Planning Session"][Math.floor(Math.random() * 5)],
            note: "Meeting notes and details will appear here",
            organizer: ["You", "Alex", "Jamie", "Taylor"][Math.floor(Math.random() * 4)]
          }))
        };
      }
    }
    return data;
  });
useEffect(()=>{console.log('events',events)},[events])
  useEffect(() => {
    if (isSignedIn) {
      // Fetch subscription status
      subscriptionApi.getStatus()
        .then(({ data }) => setSubscription(data))
        .catch(err => console.error('Error fetching subscription:', err));
      
      // Fetch user's events
      eventApi.getEvents()
        .then(({ data }) => {
          // Process events for display
          console.log('data',{data});
          const today = new Date();
          const todayEvents = data.filter(event => {
            const eventDate = new Date(event.startDate);
            console.log('eventDate',eventDate);
            console.log('todayDate',today);
            return eventDate.toDateString() === today.toDateString();
          }).map(event => ({
            time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: event.title,
            color: event.priority === 'high' ? 'red' : event.priority === 'medium' ? 'blue' : 'green'
          }));
          
          const tomorrowDate = new Date();
          tomorrowDate.setDate(today.getDate() + 1);
          const tomorrowEvents = data.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === tomorrowDate.toDateString();
          }).map(event => ({
            time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: event.title,
            color: event.priority === 'high' ? 'purple' : event.priority === 'medium' ? 'blue' : 'green'
          }));
          console.log('todayEvents',todayEvents);
          console.log('tomorrowEvents',tomorrowEvents);
          setEvents({
            today: todayEvents,
            tomorrow: tomorrowEvents
          });
        })
        .catch(err => console.error('Error fetching events:', err));
    }
  }, [isSignedIn]);
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    setMessages([...messages, { type: 'user', text: chatInput }]);
    setIsProcessing(true);
    
    const userInput = chatInput;
    setChatInput('');

    try {
      // Process the scheduling request via the backend
      const { data } = await aiApi.processSchedulingRequest(userInput);
      
      if (data.success) {
        // Format suggested times for display
        const formattedSlots = data.suggestedSlots.map(slot => 
          `${slot.startTime} - ${slot.endTime} on ${slot.date}`
        );
        
        setSuggestedTimes(formattedSlots);
        
        // Show upgrade message for free tier
        let message = `I can schedule "${data.eventDetails.title}" for you. Here are some suggested times:`;
        if (!data.isPremium && subscription.status === 'free') {
          message += ' Upgrade to premium for more time slot suggestions and advanced scheduling features.';
        }
        
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: message
        }]);
        
        // Store event details for creation
        setCurrentEventData(data.eventDetails);
        
        // Open the suggestions modal
        setIsModalOpen(true);
      } else {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: data.message || "I couldn't understand your request. Could you provide more details?"
        }]);
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: "Sorry, I encountered an error processing your request."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };
// Add a function to save an event when a slot is selected
const handleSlotSelect = async (slot) => {
  if (!currentEventData) return;
  
  // Parse date and time information
  const [timeStr, dateStr] = slot.split(' on ');
  console.log('tipmerstr\n',timeStr);
  console.log('datestr',dateStr);
  const [startTimeStr, endTimeStr] = timeStr.split(' - ');
  console.log(startTimeStr,endTimeStr,dateStr);
  // Create date objects
  const [year,month,day] = dateStr.split('-').map(Number);
  console.log('yakdjf',year,month,day);
  console.log(month, day, year);
  const startDate = new Date(year, month - 1, day);
  const [startHour, startMinuteStr] = startTimeStr.split(':');
  let startHourNum = parseInt(startHour);
  const isPM = startMinuteStr.includes('PM');
  if (isPM && startHourNum !== 12) startHourNum += 12;
  if (!isPM && startHourNum === 12) startHourNum = 0;
  const startMinute = parseInt(startMinuteStr);
  startDate.setHours(startHourNum, startMinute);
  console.log('startdate',startDate);
  console.log('starMinute',startMinute);
  
  // Calculate end date based on duration or end time
  const endDate = new Date(startDate);
  if (endTimeStr) {
    const [endHour, endMinuteStr] = endTimeStr.split(':');
    let endHourNum = parseInt(endHour);
    const endIsPM = endMinuteStr.includes('PM');
    if (endIsPM && endHourNum !== 12) endHourNum += 12;
    if (!endIsPM && endHourNum === 12) endHourNum = 0;
    const endMinute = parseInt(endMinuteStr);
    endDate.setHours(endHourNum, endMinute);
  } else {
    // Default to 1-hour meeting if no end time
    endDate.setHours(endDate.getHours() + 1);
  }
  
  try {
    const eventData = {
      title: currentEventData.title,
      description: currentEventData.description || '',
      startDate,
      endDate,
      eventType: currentEventData.eventType,
      participants: currentEventData.participants || [],
      priority: currentEventData.priority || 'medium'
    };
    console.log('eventData',eventData);
    // return;
    // Create the event in the database
    const { data } = await eventApi.createEvent(eventData);
    
    // Add to local events state
    setEvents(prev => {
      const isToday = startDate.toDateString() === new Date().toDateString();
      const isTomorrow = startDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
      if (isToday) {
        return {
          ...prev,
          today: [...prev.today, { 
            time: startTimeStr, 
            title: data.title, 
            color: data.priority === 'high' ? 'red' : data.priority === 'medium' ? 'blue' : 'green' 
          }]
        };
      } else if (isTomorrow) {
        return {
          ...prev,
          tomorrow: [...prev.tomorrow, { 
            time: startTimeStr, 
            title: data.title, 
            color: data.priority === 'high' ? 'purple' : data.priority === 'medium' ? 'blue' : 'green' 
          }]
        };
      }
      
      return prev;
    });
    
    // Close modal and show confirmation
    setIsModalOpen(false);
    setMessages(prev => [...prev, { 
      type: 'ai', 
      text: `Great! I've scheduled "${data.title}" for ${startTimeStr} on ${dateStr}.`
    }]);
  } catch (error) {
    console.error('Error creating event:', error);
    setMessages(prev => [...prev, { 
      type: 'ai', 
      text: "Sorry, I couldn't save your event. Please try again."
    }]);
  }
};
const handleChatInputChange = (event) => {
  // event.preventDefault();
  setChatInput(event.target.value);
}
  // Add new event
  const addNewEvent = () => {
    setEvents({
      ...events,
      today: [...events.today, { time: '3:00 PM', title: 'New Event', color: 'green' }]
    });
  };
  
  function debounce(func,{ baseDelay = 150, minDelay = 30, windowSize = 10, threshold = 10 } = {}){
    let timer;
    let deltaTimes = [];
    let lastEvent=Date.now();
    return (...args) => {
      const now=Date.now();
      const deltaT=now-lastEvent;
      lastEvent=now;

          // Save deltaT, maintaining a fixed window of recent events
    deltaTimes.push(deltaT);
    if (deltaTimes.length > windowSize) {
      deltaTimes.shift();
    }

        // Compute the average delta over the window
        const avgDelta = deltaTimes.reduce((sum, t) => sum + t, 0) / deltaTimes.length;

        let computedDelay;
    if (avgDelta < threshold) {
      computedDelay = minDelay;
    } else {
      // Increase delay relative to how much avgDelta exceeds the threshold,
      // up to a maximum of baseDelay.
      computedDelay = Math.min(baseDelay, minDelay + (avgDelta - threshold));
    }
      if(timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, computedDelay);
      
    }
  }
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Handle scheduling
  const handleSchedule = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setPrompt("");
      setIsModalOpen(true);
    }, 1500);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "schedule" ? "calendar" : "schedule");
    setIsDrawerOpen(false);
  };

  // Handle day selection in calendar
  const handleDayClick = (day) => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()+1}-${day}`;
    console.log('day', day);
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    
    if (calendarData[dateKey] && calendarData[dateKey].events) {
      setSelectedDayEvents(calendarData[dateKey].events);
      setIsDrawerOpen(true);
    } else {
      setSelectedDayEvents([]);
      setIsDrawerOpen(false);
    }
  };

  // Handle event selection
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // Get month days array
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Fill in the days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(i);
    }
    
    return {
      days,
      firstDayIndex: firstDayOfMonth.getDay(),
      lastDate: lastDayOfMonth.getDate()
    };
  };

  // Format date string
  const formatDate = (date) => {
    const formattedDate= new Intl.DateTimeFormat('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
    return formattedDate;
  };
  
  const today = formatDate();
  const tomorrow = {
    ...formatDate(),
    dayName: formatDate().dayName === 'Saturday' ? 'Sunday' : 
             formatDate().dayName === 'Friday' ? 'Saturday' :
             formatDate().dayName === 'Thursday' ? 'Friday' :
             formatDate().dayName === 'Wednesday' ? 'Thursday' :
             formatDate().dayName === 'Tuesday' ? 'Wednesday' :
             formatDate().dayName === 'Monday' ? 'Tuesday' : 'Monday',
    date: formatDate().date + 1
  };

    // Animation variants for the cards
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.3, 
      transformOrigin: "top right"
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transformOrigin: "top right",
      transition: {
        duration: 0.2
      }
    }
  };
  // Get month name
  const getMonthName = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  };

  // Get calendar data
  const monthData = getDaysInMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-center items-center min-h-screen bg-gray-100 p-4"
    >
      <div className="relative flex">
        {/* Main Card */}
        <motion.div
          className="relative w-[480px] h-[450px]  p-4 rounded-2xl  bg-gradient-to-br from-white to-gray-100 shadow-lg border border-gray-200"
          layout
        >
          {/* Background gradient animation */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Header with toggle */}
          <motion.div
            className="flex items-center justify-between mb-4 relative"
            // whileHover={{ scale: 1.02 }}
            // transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              {/* Blob-like logo */}
              <motion.div
                className="relative w-8 h-8 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-blue-500 rounded-full"
                  animate={{
                    borderRadius: [
                      "50% 50% 50% 50%",
                      "60% 40% 40% 60%",
                      "40% 60% 60% 40%",
                      "50% 50% 50% 50%",
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <svg
                  className="w-5 h-5 text-white relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-800">CalBuddy</h3>
            </div>
            {/* subscription badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium mr-2
                  ${
                    subscription.status === "premium"
                      ? "bg-purple-100 text-purple-700"
                      : subscription.status === "basic"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
            >
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </span>
            {/* Toggle Switch */}
            <motion.button
              onClick={toggleViewMode}
              className="relative w-12 h-6 bg-gray-200 rounded-full p-1 flex items-center"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-blue-500 absolute"
                animate={{ x: viewMode === "schedule" ? 1 : 26 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
              <span className="sr-only">Toggle View</span>
            </motion.button>
          </motion.div>

          {/* Content based on view mode */}
          <AnimatePresence mode="wait">
            {viewMode === "schedule" ? (
              <motion.div
                key="schedule-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="flex flex-row justify-between w-full">
                  {/* Left Column - Chat Section */}
                  <div
                    className={`flex flex-col  ${
                      toggle ? "w-1/2" : "w-full"
                    } transition-transform duration-1000 p-2 border-r border-gray-100`}
                  >
                    {/* Chat Messages Area */}
                    <div className="h-64 overflow-y-auto mb-2 p-2">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`mb-2 ${
                            message.type === "user" ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`inline-block p-2 rounded-xl max-w-xs ${
                              message.type === "user"
                                ? "bg-blue-50 rounded-tr-none ml-auto"
                                : "bg-gradient-to-r from-blue-50 to-blue-100 rounded-tl-none shadow-sm"
                            }`}
                          >
                            <p className="text-gray-700 text-xs">
                              {message.text}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex gap-1 ml-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input Area */}
                    <form onSubmit={handleChatSubmit} className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e)=>handleChatInputChange(e)}
                        className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Tell AI your schedule..."
                      />
                      <button
                        type="submit"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                        )}
                      </button>
                    </form>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-1 mt-2">
                      <button className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg rounded-tr-none text-xs font-medium flex items-center gap-1 hover:bg-blue-200 transition-colors">
                        <svg
                          className="w-2 h-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        meet
                      </button>
                      <button className="px-2 py-1 bg-purple-100 text-purple-600 rounded-lg rounded-tl-none text-xs font-medium flex items-center gap-1 hover:bg-purple-200 transition-colors">
                        <svg
                          className="w-2 h-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                        Break
                      </button>
                      <button className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-green-200 transition-colors">
                        <svg
                          className="w-2 h-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M6 17.657l.707.707"
                          />
                        </svg>
                        Focus
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Cards */}
                  <div
                    className={` p-2 flex h-fit ${
                      toggle ? "" : "w-0.5"
                    } flex-col bg-transparent  `}
                  >
                    {/* Today Card */}
                    <div
                      onClick={() => setToggle(!toggle)}
                      className="absolute top-0 right-0 w-4 h-4 hover:cursor-pointer rounded-bl-md rounded-tl-md rounded-br-md bg-gradient-to-br hover:scale-125 transition-all duration-300 from-purple-500 to-gray-500 shadow-lg"
                    />
                    <AnimatePresence>
                      {toggle && (
                        <motion.div
                          className="flex flex-col w-full"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          {/* Today Card */}
                          <motion.div variants={cardVariants} exit="exit">
                            <div
                              className={`mb-2 bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                                activeCard === "today"
                                  ? "ring-1 ring-blue-400"
                                  : ""
                              }`}
                              onClick={() =>
                                setActiveCard(
                                  activeCard === "today" ? null : "today"
                                )
                              }
                            >
                              <div className="p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <h3 className="font-bold text-blue-800 text-xs">
                                    Today
                                  </h3>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      {today.dayName}
                                    </p>
                                    <p className="text-sm font-semibold">
                                      {today.monthName} {today.date}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {today.year}
                                  </span>
                                </div>
                              </div>
                              <div className="px-2 pb-2">
                                {events.today.length === 0 ? (
                                  <div className="py-1 text-center text-gray-500 text-xs bg-blue-50 rounded">
                                    No events scheduled
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {events.today.map((event, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-1 p-1 bg-blue-50 rounded"
                                      >
                                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                        <span className="text-xs text-blue-800">
                                          {event.time}
                                        </span>
                                        <span className="text-xs font-medium">
                                          {event.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>

                          {/* Tomorrow Card */}
                          <motion.div variants={cardVariants} exit="exit">
                            <div
                              className={`mb-2 bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                                activeCard === "tomorrow"
                                  ? "ring-1 ring-purple-400"
                                  : ""
                              }`}
                              onClick={() =>
                                setActiveCard(
                                  activeCard === "tomorrow" ? null : "tomorrow"
                                )
                              }
                            >
                              <div className="p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                  <h3 className="font-bold text-purple-800 text-xs">
                                    Tomorrow
                                  </h3>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      {tomorrow.dayName}
                                    </p>
                                    <p className="text-sm font-semibold">
                                      {tomorrow.monthName} {tomorrow.date}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {tomorrow.year}
                                  </span>
                                </div>
                              </div>
                              <div className="px-2 pb-2">
                                {events.tomorrow.length === 0 ? (
                                  <div className="py-1 text-center text-gray-500 text-xs bg-purple-50 rounded">
                                    No events scheduled
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {events.tomorrow.map((event, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-1 p-1 bg-purple-50 rounded"
                                      >
                                        <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                                        <span className="text-xs text-purple-800">
                                          {event.time}
                                        </span>
                                        <span className="text-xs font-medium">
                                          {event.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>

                          {/* Add New Event Card */}
                          <motion.div variants={cardVariants} exit="exit">
                            <div
                              className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
                              onClick={addNewEvent}
                            >
                              <div className="p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <h3 className="font-bold text-green-800 text-xs">
                                    New Event
                                  </h3>
                                </div>
                              </div>
                              <div className="px-2 pb-2 pt-1 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-1">
                                  <svg
                                    className="w-4 h-4 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                </div>
                                <p className="text-xs text-green-600">
                                  Create a new event
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Integrated UI from first file ends here */}
              </motion.div>
            ) : (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Month Header */}
                <div className="flex justify-center  items-center mb-4">
                  <MonthSelector
                    setSelectedDate={setSelectedDate}
                    selectedDate={selectedDate}
                  />
                  <YearSelector
                    setSelectedDate={setSelectedDate}
                    selectedDate={selectedDate}
                  />
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the first of the month */}
                  {Array.from({ length: monthData.firstDayIndex }).map(
                    (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="h-10 rounded-lg bg-gray-50"
                      />
                    )
                  )}

                  {/* Days of the month */}
                  {monthData.days.map((day) => {
                    const dateKey = `${selectedDate.getFullYear()}-${
                      selectedDate.getMonth() + 1
                    }-${day}`;
                    const hasEvents =
                      calendarData[dateKey] && calendarData[dateKey].count > 0;
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === selectedDate.getMonth() &&
                      new Date().getFullYear() === selectedDate.getFullYear();
                    const isSelected = selectedDate.getDate() === day;

                    return (
                      <motion.div
                        key={day}
                        className={`h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer relative 
                                  ${isToday ? "bg-blue-100" : "bg-white"} 
                                  ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => handleDayClick(day)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span
                          className={`text-sm ${
                            isToday
                              ? "font-bold text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </span>

                        {/* Event indicator */}
                        {hasEvents && (
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                            <div className="text-xs text-blue-500 font-medium">
                              +{calendarData[dateKey].count}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Add Event Button (same as in schedule view) */}
                <motion.div
                  className="flex justify-end mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* <motion.button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.span>
                    Add Event
                  </motion.button> */}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Event Drawer */}
          <AnimatePresence>
            {isDrawerOpen && (
              <motion.div
                className="w-60  absolute left-[100%] top-0 z-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 ml-4 overflow-hidden"
                initial={{
                  opacity: 0,
                  x: -100,
                  z: -20,
                  rotateY: -30,
                }}
                animate={{
                  opacity: 1,
                  x: 0, // Final position
                  z: 0,
                  rotateY: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  // Optionally allow overshoot (default behavior) without specifying extra keyframes
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Events for {selectedDate.getDate()}
                  </h3>
                  <button
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedDayEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "#EBF5FF" }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-blue-600">
                          {event.time}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {event.organizer}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 mt-1">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {event.note}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* AI Suggestions Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-4 w-80 max-w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M6 17.657l.707.707"
                    />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800">
                  AI Suggested Times
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                {suggestedTimes.map((time, index) => (
                  <motion.div
                    key={time}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#EBF5FF" }}
                    onClick={() => handleSlotSelect(time)}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-800">{time}</span>
                    </div>
                  </motion.div>
                ))}

                {subscription.status === "free" && (
                  <div className="text-center text-xs text-blue-600 mt-2">
                    <a href="/subscription" className="font-medium">
                      Upgrade to premium for more time slot suggestions and
                      advanced features
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
                  onClick={() => handleSlotSelect(suggestedTimes[0])}
                  disabled={suggestedTimes.length === 0}
                >
                  Accept First
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const App=() => {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        <Route 
          path="/subscription" 
          element={
            <AuthWrapper>
              {/* <SubscriptionPlans /> */}
              <div>subscription plans</div>
            </AuthWrapper>
          } 
        />
        <Route 
          path="/subscription/success" 
          element={
            <AuthWrapper>
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Subscription Successful!</h2>
                  <p className="text-gray-600 text-center mb-6">Your account has been upgraded successfully.</p>
                  <div className="flex justify-center">
                    <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                      Back to Calendar
                    </a>
                  </div>
                </div>
              </div>
            </AuthWrapper>
          } 
        />
        <Route 
          path="/subscription/cancel" 
          element={
            <AuthWrapper>
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Subscription Cancelled</h2>
                  <p className="text-gray-600 text-center mb-6">Your subscription was not completed.</p>
                  <div className="flex justify-center">
                    <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                      Back to Calendar
                    </a>
                  </div>
                </div>
              </div>
            </AuthWrapper>
          } 
        />
        <Route 
          path="/" 
          element={
            <AuthWrapper>
              <MainCalendar />
            </AuthWrapper>
          } 
        />
      </Routes>
    </Router>
  );
}


export default App;