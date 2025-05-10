import React from "react";
import { motion, } from "framer-motion";
import { useUser } from '@clerk/clerk-react';
import { SignInButton,SignUpButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// auth related import 

import { useSyncUser } from "./hooks/useSyncUser";
import {  selectAuthOpen } from "./redux/authSlice";

import MainCalendar from './components/Calender';

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