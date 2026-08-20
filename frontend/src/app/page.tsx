"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit transition after 1.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1500);

    // Redirect to dashboard after 2 seconds
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  // Framer motion variants for staggered text
  const letterVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -90 },
    visible: { opacity: 1, y: 0, rotateX: 0 }
  };

  const title = "MOMENTUM";

  return (
    <motion.div 
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Background Animated Gradients / Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[100px]"
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, -40, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content Container */}
      <motion.div 
        className="relative z-10 flex flex-col items-center"
        animate={isExiting ? { scale: 1.1, opacity: 0, filter: "blur(10px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Abstract Animated Logo */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center perspective-1000">
          {/* Glassmorphic backdrop */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-foreground/5 to-foreground/10 rounded-[32px] backdrop-blur-2xl border border-foreground/10 shadow-2xl"
            initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* SVG Graph Animation */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 absolute z-10 drop-shadow-xl overflow-visible">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
            </defs>
            
            {/* Background Grid Lines for tech feel */}
            <motion.path 
              d="M 10 90 L 90 90 M 10 90 L 10 10 M 36 90 L 36 10 M 63 90 L 63 10 M 10 63 L 90 63 M 10 36 L 90 36" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              strokeOpacity="0.1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />

            {/* The dramatic upward line (Smooth Bezier Curve) */}
            <motion.path
              d="M 10 85 C 30 85, 25 50, 45 50 C 60 50, 55 20, 90 15"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-foreground"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />

            {/* Glowing Peak Dot */}
            <motion.circle
              cx="90"
              cy="15"
              r="6"
              className="text-foreground"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
            />
            
            {/* Ripple effect on peak */}
            <motion.circle
              cx="90"
              cy="15"
              r="6"
              fill="none"
              className="text-foreground"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
            />
          </svg>
        </div>

        {/* Staggered Text Reveal */}
        <div className="flex space-x-1 perspective-1000 mt-2">
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground drop-shadow-sm"
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              transition={{ 
                duration: 0.5, 
                delay: 0.6 + (index * 0.04), 
                type: "spring", 
                bounce: 0.4 
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        {/* Subtle Subtitle */}
        <motion.p
          className="mt-6 text-muted-foreground font-medium tracking-[0.3em] uppercase text-xs md:text-sm"
          initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        >
          Track Your Progress
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
