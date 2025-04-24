import React from 'react';
import { motion } from 'framer-motion';
import {useApiAuth } from '../services/api';
import { useAuth } from '@clerk/clerk-react';

const SubscriptionPlans = ({ subscription, onClose }) => {
    const {getToken}=useAuth();
    const {subscriptionApi}=useApiAuth(getToken);

  return (
    <motion.div
      className="w-full h-fit relative "
      initial={{ y: "100%",opacity:0,z:-10 }}
      animate={{ y: 0,opacity:1,z:10 }}
      exit={{ y: "100%",z:-10,opacity:0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >

      <div className="h-full flex flex-col gap-2 overflow-y-auto bg-slate-100 rounded-2xl p-4">
      <div className="flex   items-center justify-between rounded-2xl mb-2 p-2">
        <h2 className="text-lg font-bold text-gray-800">Subscription Plans</h2>
        <button
          className="p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className='flex flex-row justify-between items-center p-1'>
        {/* Free Plan */}
        <div className=" flex hover:cursor-pointer bg-white h-fit flex-col drop-shadow-md  rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-bold">Free</h3>
            {subscription.status === "free" && (
              <span className="px-3  py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                Current Plan
              </span>
            )}
          </div>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center text-xs text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Basic scheduling
            </li>
            <li className="flex items-center text-xs text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Up to 5 events/month
            </li>
          </ul>
          {subscription.status === "free" ? (
            <div className="w-full py-2 bg-blue-50 text-sm text-blue-500 rounded-lg text-center font-medium">
              Current Plan
            </div>
          ) : (
            <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
              Downgrade
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className="bg-white hover:cursor-pointer flex h-ft drop-shadow-md hover:drop-shadow-2xl drop-shadow-slate-200 hover:drop-shadow-blue-200 transition-all duration-100 flex-col mb-10 rounded-xl p-4 relative">
          <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Recommended
          </div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-bold">Pro</h3>
            {subscription.status === "premium" && (
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                Current Plan
              </span>
            )}
          </div>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center text-xs text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Unlimited scheduling
            </li>
            <li className="flex items-center text-xs text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              AI-powered suggestions
            </li>
            <li className="flex items-center text-xs text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Priority support
            </li>
          </ul>
          {subscription.status === "premium" ? (
            <div className="w-full py-2 bg-blue-50 text-blue-500 rounded-lg text-center font-medium">
              Current Plan
            </div>
          ) : (
            <button
              className="w-full py-2 text-sm bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center"
              onClick={() => {
                // Here you would call your subscription API
                subscriptionApi
                  .createCheckoutSession("pro_price_id", "pro")
                  .then(({ data }) => {
                    // Redirect to checkout page
                    window.location.href = data.url;
                  })
                  .catch((err) => {
                    console.error("Error creating checkout session:", err);
                  });
              }}
            >
              Upgrade Now
              <svg
                className="w-4 h-4 ml-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5L19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

      </div>

        {/* Enterprise Plan
        <div className="border rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-bold">Enterprise</h3>
            <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
              Custom
            </span>
          </div>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center text-xs text-gray-700">
              <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              All Pro features
            </li>
            <li className="flex items-center text-xs text-gray-700">
              <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Custom integrations
            </li>
            <li className="flex items-center text-xs text-gray-700">
              <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dedicated support
            </li>
          </ul>
          <button 
            className="w-full py-2 text-sm bg-purple-100 text-purple-600 rounded-lg font-medium flex items-center justify-center"
            onClick={() => {
              // Open mail client with pre-filled email
              window.location.href = "mailto:sales@calbuddy.com?subject=Enterprise%20Plan%20Inquiry";
            }}
          >
            Contact Sales
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9L12 15L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div> */}
      </div>
    </motion.div>
  );
};

export default SubscriptionPlans;