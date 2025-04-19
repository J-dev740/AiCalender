import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Add setSelectedDate as a prop
const YearSelector = ({ setSelectedDate,selectedDate }) => {
  // Generate a range of years (current year - 10 to current year + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  const [activeIndex, setActiveIndex] = useState(10); // Default to current year (middle of array)
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update parent's selectedDate whenever activeIndex changes
  useEffect(() => {
    const newDate = new Date();
    newDate.setFullYear(years[activeIndex]);
    newDate.setDate(selectedDate.getDate()); // Set to first day of month for consistency
    setSelectedDate(newDate);
  }, [activeIndex,!!years]);

  // Handle year selection from dropdown
  const handleYearSelect = (index) => {
    setActiveIndex(index);
    setShowDropdown(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          !event.target.closest('.year-display')) {
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
      className="relative w-20  flex items-center justify-center"
      ref={containerRef}
    >
      {/* Year Display */}
      <div 
        className="flex items-center justify-center text-lg text-gray-800 font-semibold cursor-pointer year-display"
        onClick={toggleDropdown}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.1 }}
        >
          {years[activeIndex]}
        </motion.span>
      </div>

      {/* Year Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            className="absolute -top-[40px] w-[120px] p-2 mt-1 bg-white shadow-sm rounded-xl z-50 max-h-64 overflow-x-hidden custom-scrollbar m-2"
            style={{ 
              left: "50%", 
              transform: "translateX(-50%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            initial={{ opacity: 0, y: -5, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -5, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="py-1">
              {years.map((year, index) => (
                <motion.div
                  key={`dropdown-${year}`}
                  className={`px-3 py-1.5 my-1 rounded-md cursor-pointer text-sm ${
                    index === activeIndex ? 'text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleYearSelect(index)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.1 }}
                >
                  {year}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YearSelector;