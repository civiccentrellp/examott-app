"use client";

import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { AuthCard } from "./AuthCard";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div
      className="flex h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
    >
      {/* Container */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-[500px] rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-200">
        
        {/* Left Panel - Auth Form */}
        <motion.div
          className="w-full md:w-1/2 h-full p-8 md:p-12 flex justify-center items-center bg-gray-900 text-white order-2 md:order-1"
          key={isSignIn ? "signIn" : "signUp"}
          initial={{ x: isSignIn ? 40 : -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {isSignIn ? (
            <SignInForm toggle={() => setIsSignIn(false)} />
          ) : (
            <SignUpForm toggle={() => setIsSignIn(true)} />
          )}
        </motion.div>

        {/* Right Panel - Welcome Card */}
        <motion.div
          className="w-full md:w-1/2 h-full flex flex-col justify-center items-center text-center p-8 md:p-12 bg-gray-50 order-1 md:order-2"
          key={isSignIn ? "welcomeSignIn" : "welcomeSignUp"}
          initial={{ x: isSignIn ? -40 : 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AuthCard isSignIn={isSignIn} toggle={() => setIsSignIn(!isSignIn)} />
        </motion.div>
      </div>
    </div>
  );
}
