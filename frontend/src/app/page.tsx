"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Exact 1-second redirect as requested
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  const title = "MOMENTUM";

  // Elements related to the app (tasks, checkboxes, graphs) floating upwards in the background
  const floatingElements = [...Array(18)].map((_, i) => {
    const isTask = i % 3 === 0;
    const isGraph = i % 3 === 1;
    return (
      <motion.div
        key={i}
        className="absolute z-0 text-muted-foreground/30 dark:text-muted-foreground/10"
        style={{
          left: `${Math.random() * 90 + 5}%`,
          top: `${Math.random() * 50 + 70}%`, // Start below the visible screen
        }}
        initial={{ y: 0, scale: Math.random() * 0.5 + 0.8, rotate: 0 }}
        animate={{ 
          y: -1200, // Shoot rapidly upwards
          rotate: Math.random() * 90 - 45 
        }}
        transition={{
          duration: Math.random() * 0.4 + 0.5, // Extremely fast animation (0.5s - 0.9s)
          ease: "easeOut",
        }}
      >
        {isTask ? (
          // Checkbox UI element
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
        ) : isGraph ? (
          // Mini Graph element
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"></path>
            <path d="M18 17V9"></path>
            <path d="M13 17V5"></path>
            <path d="M8 17v-3"></path>
          </svg>
        ) : (
          // Text block element (notes)
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )}
      </motion.div>
    );
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Dynamic App-Related Background Animations */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements}
      </div>

      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Sleek, Fast "M" Ascending Bar Graph Logo */}
        <div className="relative w-32 h-32 mb-2 perspective-1000">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-xl">
            {/* 3 Pillars of Momentum */}
            <motion.rect x="10" y="60" width="20" height="30" rx="4" className="fill-foreground"
              initial={{ height: 0, y: 90 }} animate={{ height: 30, y: 60 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.rect x="40" y="40" width="20" height="50" rx="4" className="fill-foreground"
              initial={{ height: 0, y: 90 }} animate={{ height: 50, y: 40 }}
              transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
            />
            <motion.rect x="70" y="20" width="20" height="70" rx="4" className="fill-foreground"
              initial={{ height: 0, y: 90 }} animate={{ height: 70, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            />

            {/* Swooping Arrow breaking through (Uses a distinct brand color to pop against the white/black) */}
            <motion.path
              d="M -5 75 C 30 75, 45 35, 100 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-blue-500"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            />
            <motion.path
              d="M 80 10 L 100 10 L 100 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.2, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
        </div>

        {/* Text Reveal */}
        <div className="flex space-x-1 mt-4">
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              className="text-5xl md:text-6xl font-black tracking-tighter text-foreground"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + (index * 0.03), ease: "easeOut" }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
