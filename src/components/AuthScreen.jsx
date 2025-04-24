// src/components/AuthScreen.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn, SignUp, useClerk } from '@clerk/clerk-react';

const AuthScreen = () => {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const { signOut } = useClerk();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }
  };

  return (
    <motion.div 
      className="flex justify-center items-center min-h-screen bg-gray-100 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <div className="w-[480px] relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-lg border border-gray-200 p-6">
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

        {/* Logo & Header */}
        <motion.div 
          className="relative flex flex-col items-center mb-6"
          variants={headerVariants}
        >
          <motion.div
            className="relative w-16 h-16 flex items-center justify-center mb-4"
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
              className="w-8 h-8 text-white relative z-10"
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
          
          <h1 className="text-2xl font-bold text-gray-800 mb-1">CalBuddy</h1>
          <p className="text-gray-600 text-sm">Your AI-powered scheduling assistant</p>
        </motion.div>

        {/* Auth Container */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {mode === 'signin' ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                  <SignIn 
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "w-full shadow-none p-0 border-0",
                        headerTitle: "text-xl font-semibold text-gray-800",
                        headerSubtitle: "text-sm text-gray-600",
                        formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
                        footerAction: "text-blue-500 hover:text-blue-600",
                      }
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setMode('signup')}
                      className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                  <SignUp 
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "w-full shadow-none p-0 border-0",
                        headerTitle: "text-xl font-semibold text-gray-800",
                        headerSubtitle: "text-sm text-gray-600",
                        formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
                        footerAction: "text-blue-500 hover:text-blue-600",
                      }
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setMode('signin')}
                      className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* App Features Section */}
        <motion.div 
          className="mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CalBuddy Features:</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-800">AI Scheduling</span>
              </div>
              <p className="text-xs text-gray-600">Smart scheduling based on your preferences</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M6 17.657l.707.707" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-800">Smart Suggestions</span>
              </div>
              <p className="text-xs text-gray-600">Get the best time slots for your meetings</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-800">Natural Language</span>
              </div>
              <p className="text-xs text-gray-600">Just tell CalBuddy what you need scheduled</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-red-800">Secure & Private</span>
              </div>
              <p className="text-xs text-gray-600">Your calendar data stays private and secure</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthScreen;