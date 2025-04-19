// src/components/AuthWrapper.jsx
import React from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const AuthWrapper = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <motion.div 
        className="flex justify-center items-center min-h-screen bg-gray-100 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome to CalBuddy</h2>
              <p className="text-gray-600">AI-powered scheduling assistant</p>
            </div>
            <SignIn routing="path" path="/sign-in" />
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account? 
              <a href="/sign-up" className="text-blue-500 ml-1 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return children;
};

export default AuthWrapper;