// src/components/UserProfile.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';

const UserProfile = ({ onClose }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  // Use these values if user data is available
  const name = user ? user.fullName || 'Unknown User' : 'Loading...';
  const email = user ? user.primaryEmailAddress?.emailAddress || 'No email' : 'Loading...';
  const imageUrl = user?.imageUrl;
  const subscriptionPlan = 'Free Plan'; // This would come from your subscription state
  
  // Calculate statistics
  const eventsThisMonth = 3;
  const maxEvents = 5;
  const hoursScheduled = 4.5;

  return (
    <motion.div
      className="w-full h-fit rounded-lg p-2 bg-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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

      <div className="flex flex-col w-full h-fit">
        {/* User info section */}
        <div className="flex items-center flex-row justify-center h-full gap-4 p-2   border-b border-gray-200">
            {/* profile and plan details */}
          <div className="flex items-center gap-3 pb-2 h-full bg-white rounded-lg drop-shadow-md py-2 px-4 w-full ">
            <div className="flex w-16 h-16 rounded-full overflow-hidden bg-gray-200 ">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className=''>
              <h4 className="font-semibold text-gray-900">{name}</h4>
              <p className="text-sm text-gray-500">{subscriptionPlan}</p>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex flex-col  items-center h-fit justify-center gap-2 w-full ">
            <button className="w-full hover:cursor-pointer py-2 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </button>

            <button
              onClick={() => signOut()}
              className="w-full py-2  bg-red-100 hover:cursor-pointer text-red-600 rounded-lg text-xs font-medium flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Log Out
            </button>
          </div>
        </div>

        {/* Account details */}
        <div className="mb-4 mt-4 pb-4 flex flex-row  justify-start items-center gap-2 border-b border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 ">Email</h5>
          <p className="text-sm text-gray-900 rounded-lg bg-white drop-shadow-md px-3 py-2">
            {email}
          </p>
          <div className="border-l border-[1px] h-[20px] border-gray-500 mx-2"></div>

          <h5 className="text-sm font-medium text-gray-700 ">Time Zone</h5>
          <p className="text-sm text-gray-900 rounded-lg bg-white drop-shadow-md px-3 py-2">
            Pacific Time (PT)
          </p>
        </div>

        {/* Integrations */}
        {/* <div className="mb-4 pb-4 border-b border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Calendar Integration
          </h5>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
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
            </div>
            <span className="text-sm">Connected</span>
          </div>
        </div> */}

        {/* Usage stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 drop-shadow-md p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500 mr-1"
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
              <span className="text-xs text-gray-500">Events This Month</span>
            </div>
            <p className="text-lg font-semibold">
              {eventsThisMonth}/{maxEvents}
            </p>
          </div>

          <div className="bg-gray-50 drop-shadow-md p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500 mr-1"
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
              <span className="text-xs text-gray-500">Hours Scheduled</span>
            </div>
            <p className="text-lg font-semibold">{hoursScheduled}h</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;