"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);

  useEffect(() => {
    // Redirect to dashboard after 3.5 seconds (gives animation time to finish completely)
    const timeout = setTimeout(() => {
      setIsReadyToRedirect(true);
      router.push("/dashboard");
    }, 3500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Container for logo and text */}
      <motion.div 
        className="flex flex-col items-center justify-center z-10"
        initial={{ opacity: 1, y: 0 }}
        animate={isReadyToRedirect ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        
        {/* Animated Logo SVG */}
        <div className="w-32 h-32 mb-8 relative">
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-foreground"
          >
            {/* Grid/Axes background lines (optional, for aesthetics) */}
            <motion.path
              d="M 10 90 L 90 90 M 10 90 L 10 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            />

            {/* The main trending upward line */}
            <motion.path
              d="M 10 90 L 35 60 L 55 75 L 85 20"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* The peak dot */}
            <motion.circle
              cx="85"
              cy="20"
              r="6"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 10,
                delay: 1.8 
              }}
            />
          </svg>
        </div>

        {/* Momentum Title */}
        <motion.h1 
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
        >
          Momentum
        </motion.h1>

        {/* Tagline / Loading state */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="mt-6 flex items-center space-x-2"
        >
          <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce"></div>
        </motion.div>

      </motion.div>
      
    </div>
  );
}
