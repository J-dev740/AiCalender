// src/components/TimeSlotSelector.jsx
import React from 'react';
import { motion } from 'framer-motion';

const TimeSlotSelector = ({ slots, onSelectSlot, onCancel }) => {
  return (
    <motion.div
      className="w-full space-y-2 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {slots.map((slot, index) => (
        <motion.div
          key={index}
          className="p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, backgroundColor: "#EBF5FF" }}
          onClick={() => onSelectSlot(slot)}
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
            <span className="text-gray-800">{slot}</span>
          </div>
        </motion.div>
      ))}
      
      <motion.button
        className="w-full py-2 mt-2 bg-gray-100 rounded-lg text-gray-600 font-medium"
        whileHover={{ backgroundColor: "#E5E7EB" }}
        onClick={onCancel}
      >
        Cancel
      </motion.button>
    </motion.div>
  );
};

export default TimeSlotSelector;