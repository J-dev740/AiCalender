import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from '@clerk/clerk-react';
import { SignInButton,SignUpButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MonthSelector from "./components/monthSelector";
import YearSelector from "./components/yearSelector";
import AuthWrapper from "./components/AuthWrapper";
import Header from "./components/Header";
import SubscriptionPlans from './components/SubscriptionPlans';
import UserProfile from "./components/UserProfile";
import { useSelector,useDispatch } from "react-redux";
// auth related import 

import { useSyncUser } from "./hooks/useSyncUser";
import {  selectAuthOpen } from "./redux/authSlice";
import {useApiAuth} from './services/api';

// events related import 
import useEventEmbeddings from "./hooks/useEventEmbeddings";
import { 
  fetchEvents,
  createEvent,
  selectEvent,
  openEventModal,
  selectTodayEvents,
  selectTomorrowEvents,
  selectCalendarData,
  selectEventsLoading,
  selectEventsError
} from './redux/eventSlice';
import EventEditorModal from './components/EventEditorModal';
import EventCards from "./components/EventsCard";
import { useRagQuery } from './hooks/useRagQuery';
import EventSearchResults from './components/EventSearchResults';
import { selectSearchEvents, selectQueryType } from './redux/ragSlice';


const MainCalendar = () => {
  const { getToken } = useUser();
  const dispatch =useDispatch();
  const {aiApi,subscriptionApi}=useApiAuth(getToken);
  // State management
  const [viewMode, setViewMode] = useState("schedule"); // "schedule" or "calendar"
  // const [activeCard, setActiveCard] = useState(null);
  const [toggle,setToggle]=useState(true);
  const [chatInput, setChatInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prompt, setPrompt] = useState("");
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
  
  // Inside your App component
  const { user, isLoaded, isSignedIn } = useUser();
  const [subscription, setSubscription] = useState({ status: 'free' });
  // Redux event states
  // const allEvents = useSelector((state) => state.events.events);
  const calendarData = useSelector(selectCalendarData);

  // Redux rag states
    // Add these hooks
    const { submitQuery, isProcessing: ragIsProcessing } = useRagQuery();
    const searchEvents = useSelector(selectSearchEvents);
    const queryType = useSelector(selectQueryType);
      // Use the event embeddings hook
    useEventEmbeddings();

  const getSubStatus= async ()=>{
    try {
      const response=await subscriptionApi.getStatus();
      const {data}=response;

      setSubscription(data);
    } catch (error) {
      console.error('Error Fetching sub status',error?.message??error);
    }
  }
  useEffect(() => {
    if (isSignedIn && user) {
      getSubStatus();
      dispatch(fetchEvents());
    }
  }, [isSignedIn,user]);


    // Update selected day events when calendar data or selected date changes
    useEffect(() => {
      if (calendarData) {
        const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
        if (calendarData[dateKey] && calendarData[dateKey].events) {
          setSelectedDayEvents(calendarData[dateKey].events);
        } else {
          setSelectedDayEvents([]);
        }
      }
    }, [calendarData, selectedDate]);
   // Process events for calendar display

   const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    setMessages([...messages, { type: 'user', text: chatInput }]);
    setIsProcessing(true);
    
    const userInput = chatInput;
    setChatInput('');

    try {
      // Use the submitQuery hook to process the user input
      const result = await submitQuery(userInput);
      
      if (result && result.success) {
        // Add AI response to messages
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: result.message
        }]);
        
        // Process different query types
        if (result.type === 'EVENT_CREATION') {
          // For event creation, handle suggested time slots
          if (result.eventDetails && result.eventDetails.suggestedSlots) {
            const formattedSlots = result.eventDetails.suggestedSlots.map(slot => 
              `${slot.startTime} - ${slot.endTime} on ${slot.date}`
            );
            
            setSuggestedTimes(formattedSlots);
            setCurrentEventData(result.eventDetails);
            setIsModalOpen(true);
          }
        } 
        // Other query types (EVENT_RETRIEVAL, EVENT_UPDATE, EVENT_DELETION, OTHER)
        // are handled by the Redux state & automatically displayed via the searchEvents selector
      } else {
        // Handle error case
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: result?.message || "I couldn't process your request. Could you try again?"
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
  const [startTimeStr, endTimeStr] = timeStr.split(' - ');
  console.log(startTimeStr,endTimeStr,dateStr);
  // Create date objects
  const [year,month,day] = dateStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, day);
  const [startHour, startMinuteStr] = startTimeStr.split(':');
  let startHourNum = parseInt(startHour);
  const isPM = startMinuteStr.includes('PM');
  if (isPM && startHourNum !== 12) startHourNum += 12;
  if (!isPM && startHourNum === 12) startHourNum = 0;
  const startMinute = parseInt(startMinuteStr);
  startDate.setHours(startHourNum, startMinute);
  
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
    // Create the event using Redux
   const data= await dispatch(createEvent(eventData)).unwrap();
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
  };
  
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [currentEventData,setCurrentEventData]=useState(null);

  // Handle event click in the calendar or event list
  // This function will be called when clicking an event in the calendar view
  const handleEventClick = (event) => {
    // The event should contain a fullEvent property with all event details
    if (event?.fullEvent) {
      dispatch(selectEvent(event.fullEvent));
      dispatch(openEventModal());
    } else {
      console.error('Event data is incomplete', event);
    }
  };
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
  // Show subscription page
  const showSubscriptionView = () => {
    setViewMode("subscription");
    setIsDrawerOpen(false);
  };

    // Show profile view
    const showProfileView = () => {
      setViewMode("profile");
      setIsDrawerOpen(false);
    };
    // Handle back from subscription
  // Handle back from modal views
  const handleCloseModalView = () => {
    setViewMode(prevMode => {
      // Default back to schedule if coming from subscription or profile
      if (prevMode === "subscription" || prevMode === "profile") {
        return "schedule";
      }
      return prevMode;
    });
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
    // guard against invalid input
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
  
    // use '2-digit' for month/day if you want leading zeros
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day:   '2-digit',
      year:  'numeric'
    }).format(date);
  };
  
  const today = formatDate(new Date());
    const nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const tomorrow = {
      ...formatDate(nextDay),
      dayName: formatDate(nextDay).dayName === 'Saturday' ? 'Sunday' : 
               formatDate(nextDay).dayName === 'Friday' ? 'Saturday' :
               formatDate(nextDay).dayName === 'Thursday' ? 'Friday' :
               formatDate(nextDay).dayName === 'Wednesday' ? 'Thursday' :
               formatDate(nextDay).dayName === 'Tuesday' ? 'Wednesday' :
               formatDate(nextDay).dayName === 'Monday' ? 'Tuesday' : 'Monday',
      date: formatDate(nextDay)
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
            className="flex items-center w-full justify-between mb-4 relative"
            // whileHover={{ scale: 1.02 }}
            // transition={{ duration: 0.2 }}
          >
            {/* Header with toggle */}
            {/* Header with toggle */}
            <Header
              subscription={subscription}
              viewMode={viewMode}
              toggleViewMode={toggleViewMode}
              onShowSubscription={showSubscriptionView}
              onShowProfile={showProfileView}
            />
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
                    className={`flex flex-col w-full transition-transform duration-1000 p-2 border-r border-gray-100`}
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
                                ? "bg-white drop-shadow-md rounded-tr-none ml-auto"
                                : "bg-gradient-to-r from-blue-50 to-blue-100 rounded-tl-none shadow-sm"
                            }`}
                          >
                            <p className="text-gray-700 text-xs">
                              {message.text}
                            </p>
                          </div>
                          {message.type === "ai" &&
                            index === messages.length - 1 &&
                            searchEvents &&
                            searchEvents.length > 0 && (
                              <div className="ml-2 mt-1">
                                <EventSearchResults events={searchEvents} />
                              </div>
                            )}
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
                        onChange={(e) => handleChatInputChange(e)}
                        className="w-full px-3 drop-shadow-md p-2 bg-white  border border-gray-200 rounded-md my-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Tell AI your schedule..."
                      />
                      <button
                        type="submit"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6  flex items-center justify-center bg-blue-500 text-white rounded-md drop-shadow-2xl  border-white hover:bg-blue-600 transition-colors"
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
                    <div className="flex gap-1 max-h-[30px] mt-2">
                      <button className="px-4 py-2 bg-white drop-shadow-2xl rounded-lg rounded-tr-none text-xs font-medium flex items-center gap-1 hover:bg-blue-200 transition-colors">
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
                      <button className="px-4 py-2 bg-white drop-shadow-2xl rounded-lg rounded-tl-none text-xs font-medium flex items-center gap-1 hover:bg-purple-200 transition-colors">
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
                      <button className="px-4 py-2 bg-white drop-shadow-2xl rounded-full text-xs font-medium flex items-center gap-1 hover:bg-green-200 transition-colors">
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
                      <button
                        onClick={() => setToggle(!toggle)}
                        className="absolute right-1  px-4 py-2 bg-white drop-shadow-2xl hover:cursor-pointer  transition-all duration-200 rounded-md text-xs font-medium flex items-center gap-1 hover:bg-sky-200"
                      >
                        {toggle ? "Hide Events" : "show Events"}
                      </button>
                    </div>
                  </div>

                  {/* Add the new EventCards component */}
                  <EventCards isVisible={toggle} calendarData={calendarData} />
                </div>

                {/* Integrated UI from first file ends here */}
              </motion.div>
            ) : viewMode === "calendar" ? (
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
                  <motion.button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Create empty event and open modal
                      const now = new Date(selectedDate);
                      now.setHours(
                        new Date().getHours(),
                        new Date().getMinutes()
                      );
                      const newEvent = {
                        title: "",
                        startDate: now,
                        endDate: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour later
                        description: "",
                        priority: "medium",
                        eventType: "meeting",
                        participants: [],
                      };
                      dispatch(selectEvent(newEvent));
                      dispatch(openEventModal());
                    }}
                  >
                    <motion.span
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </motion.span>
                    Add Event
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : viewMode === "profile" ? (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className="relative h-full"
              >
                <UserProfile onClose={handleCloseModalView} />
              </motion.div>
            ) : (
              <motion.div
                key="subscription-view"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className="relative flex h-full "
              >
                <SubscriptionPlans
                  subscription={subscription}
                  onClose={handleCloseModalView}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Event Drawer */}
          <AnimatePresence>
            {isDrawerOpen && (
              <motion.div
                className="w-60  absolute left-[100%] top-0 z-50 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 ml-4 overflow-hidden"
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
                  {/* Add event button for this date */}
                  <motion.button
                    className="w-full p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center gap-2 text-blue-600 font-medium"
                    whileHover={{ scale: 1.02, backgroundColor: "#dbeafe" }}
                    onClick={() => {
                      // Create empty event for the selected date
                      const now = new Date(selectedDate);
                      now.setHours(9, 0); // Default to 9:00 AM
                      const newEvent = {
                        title: "",
                        startDate: now,
                        endDate: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour later
                        description: "",
                        priority: "medium",
                        eventType: "meeting",
                        participants: [],
                      };
                      dispatch(selectEvent(newEvent));
                      dispatch(openEventModal());
                    }}
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Event
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <EventEditorModal />
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
  const { isLoaded, isSignedIn,user } = useUser();

  if (!isLoaded) {
    return (
      <div className=" fixed  flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[400px] bg-white shadow-lg p-6">
        <div className="flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"/>
      </div>
    );
  }
  if(!isSignedIn ||selectAuthOpen===true){
    return (
      <div className=" fixed  flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-fit  bg-white shadow-lg ">
              <motion.div 
                className="w-full max-w-md h-full "
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 25,
                  stiffness: 300
                }}
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Gradient header */}
                  <div className="bg-gradient-to-r from-white rounded-lg to-gray-400 px-4 py-2  text-black">
                    <h2 className="text-lg font-bold">Welcome to CalBuddy</h2>
                    <p className="opacity-80 mt-1  text-sm">AI-powered scheduling assistant</p>
                  </div>
                  
                  <div className="p-4 flex flex-col justify-center items-center">
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6">
                      Sign in to access your intelligent calendar and let AI handle your scheduling needs.
                    </p>
                    
                    {/* Sign in button */}
                    <motion.div 
                      className=" "
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SignInButton mode="modal">
                        <button className="w-fit text-sm bg-gradient-to-r from-white rounded-lg to-gray-400  font-medium py-3 px-4 text-black flex items-center justify-center transition-all duration-200">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 15C14 13.3431 12.6569 12 11 12H6C4.34315 12 3 13.3431 3 15V19H14V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 7V12M15 7H12M15 7H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="8.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 14H21V19H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Sign In 
                        </button>
                      </SignInButton>
                    </motion.div>
                    
                    {/* Divider */}
                    <div className="flex items-center my-2">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    
                    {/* Sign up section */}
                    <div className="flex flex-col justify-center items-center text-center text-xs">
                      <p className="text-gray-600 mb-4">Don't have an account yet?</p>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SignUpButton mode="modal">
                          <button className="w-fit object-center text-sm bg-gradient-to-r from-white rounded-lg to-gray-400 font-medium py-3 px-4  flex items-center justify-center transition-all duration-200">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Sign Up
                          </button>
                        </SignUpButton>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
                    <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
                  </div>
                </div>
              </motion.div>
    </div>
    )
  }
  useSyncUser();
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
              <MainCalendar />
          } 
        />
      </Routes>
    </Router>
  );
}


export default App;