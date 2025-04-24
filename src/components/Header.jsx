import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ 
    subscription, 
    viewMode, 
    toggleViewMode,
    onShowSubscription,
    onShowProfile
}) => {

  return (
    <>
      <motion.div className="flex items-center w-full justify-between mb-4 relative">
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

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Upgrade Button */}
          <motion.button
             onClick={onShowSubscription}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
            whileHover={{ backgroundColor: "#dbeafe" }}
            whileTap={{ scale: 0.97 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Upgrade
          </motion.button>

          {/* User Avatar */}
          <motion.button
            className="w-8 h-8 rounded-full bg-gray-100 hover:cursor-pointer flex items-center justify-center text-gray-600"
            whileHover={{ backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.95 }}
            onClick={onShowProfile}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </motion.button>

          {/* View Switching Buttons */}
          {viewMode === "schedule" ? (
            <motion.button
              onClick={toggleViewMode}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              aria-label="Switch to calendar view"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 2V6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              onClick={toggleViewMode}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              aria-label="Switch to chat view"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          )}

          {/* Toggle Switch - Removing as requested */}
        </div>
      </motion.div>
    </>
  );
};

export default Header;