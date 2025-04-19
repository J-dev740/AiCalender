import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Add setSelectedDate as a prop
const MonthSelector = ({ setSelectedDate,selectedDate }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const [activeIndex, setActiveIndex] = useState(new Date().getMonth());
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update parent's selectedDate whenever activeIndex changes
  useEffect(() => {
    // Create a new date with current year and selected month
    const newDate = new Date();
    newDate.setMonth(activeIndex);
    newDate.setDate(selectedDate.getDate()); 
    if(newDate.getMonth()!==new Date(selectedDate).getMonth())// Set to the same day of month as selectedDate for consistency
    setSelectedDate(newDate);
  }, [activeIndex]);

  // Handle month selection from dropdown
  const handleMonthSelect = (index) => {
    setActiveIndex(index);
    setShowDropdown(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    console.log('monthselector')
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          !event.target.closest('.month-display')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      className="relative w-28  flex items-center justify-center"
      ref={containerRef}
    >
      {/* Month Display */}
      <div 
        className="flex items-center justify-center text-lg text-gray-800 font-semibold cursor-pointer month-display"
        onClick={toggleDropdown}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.1 }}
        >
          {months[activeIndex]}
        </motion.span>
        {/* <motion.svg 
          className="ml-1 w-4 h-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          animate={{ rotate: showDropdown ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg> */}
      </div>

      {/* Month Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            className="absolute -top-[40px] w-[140px]  p-2 mt-1 bg-white shadow-sm rounded-xl  z-50 max-h-64 overflow-x-hidden custom-scrollbar m-2"
            style={{ 
              left: "50%", 
              transform: "translateX(-50%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            //   border: "1px solid black"
            }}
            initial={{ opacity: 0, y: -5, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -5, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="py-1 ">
              {months.map((month, index) => (
                <motion.div
                  key={`dropdown-${month}`}
                  className={`px-3 py-1.5  my-1 rounded-md   cursor-pointer text-sm ${
                    index === activeIndex ? 'text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleMonthSelect(index)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.1 }}
                >
                  {month}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthSelector;