import React from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const AuthWrapper = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center w-[450px] h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <motion.div 
          className="w-full max-w-md h-[400px]"
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
            <div className="bg-gradient-to-r from-white rounded-lg to-gray-400 p-6 text-black">
              <h2 className="text-2xl font-bold">Welcome to CalBuddy</h2>
              <p className="opacity-80 mt-1">AI-powered scheduling assistant</p>
            </div>
            
            <div className="p-8">
              {/* Description */}
              <p className="text-gray-600 mb-6">
                Sign in to access your intelligent calendar and let AI handle your scheduling needs.
              </p>
              
              {/* Sign in button */}
              <motion.div 
                className="mb-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SignInButton mode="modal">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 15C14 13.3431 12.6569 12 11 12H6C4.34315 12 3 13.3431 3 15V19H14V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 7V12M15 7H12M15 7H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 14H21V19H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign In to Your Account
                  </button>
                </SignInButton>
              </motion.div>
              
              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              {/* Sign up section */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">Don't have an account yet?</p>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SignUpButton mode="modal">
                    <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Create a New Account
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
    );
  }

  return children;
};

export default AuthWrapper;