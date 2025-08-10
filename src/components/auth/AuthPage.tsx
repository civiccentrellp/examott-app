"use client";

import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { AuthCard } from "./AuthCard";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      {/* Blurred Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xs"
        style={{ backgroundImage: "url('/assets/bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/30" /> {/* optional light overlay */}

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col md:flex-row w-full md:max-w-6xl h-full md:h-[70%] 
                      rounded-4 shadow-2xl overflow-hidden bg-white">

        {/* Left Panel - Gradient BG */}
        <div className="relative w-full md:w-2/3 flex flex-col justify-center items-center 
                        bg-gradient-to-br from-violet-400 via-violet-100 to-white p-4 text-gray-800">
          <AuthCard isSignIn={isSignIn} toggle={() => setIsSignIn(!isSignIn)} />

          {/* Edge soft merge overlay */}
          <div className="hidden md:block absolute top-0 right-0 w-12 h-full 
                          bg-gradient-to-r from-transparent to-white pointer-events-none"></div>
        </div>

        {/* Right Panel - Auth Form */}
        <motion.div
          className="w-full md:w-1/3 flex flex-col justify-center items-center p-10 bg-white"
          key={isSignIn ? "signIn" : "signUp"}
          initial={{ opacity: 0, x: isSignIn ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md space-y-6">
            {isSignIn ? (
              <SignInForm toggle={() => setIsSignIn(false)} />
            ) : (
              <SignUpForm toggle={() => setIsSignIn(true)} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
