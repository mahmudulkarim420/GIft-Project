"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  "Preparing your surprise... ❤️",
  "Loading love... ✨",
  "Something special is waiting for you 💖",
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Cycle messages every 1.5 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    // Progress bar animation (total 4 seconds)
    const totalDuration = 4000;
    const intervalTime = 50;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / steps) * 100;
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(progressInterval);
        setTimeout(onComplete, 500); // Small delay at 100% before transition
      }
    }, intervalTime);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  // Generate random positions for background particles
  useEffect(() => {
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ffe6f2 0%, #e6e6ff 50%, #fff0e6 100%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Soft Animated Background Mesh Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-pink-300 blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-300 blur-[120px] pointer-events-none"
      />

      {/* Floating Sparkles & Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/60 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.9)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: ["0%", "-50%", "0%"],
            x: ["0%", "20%", "0%"],
            opacity: [0.1, 0.7, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Hearts Layer */}
      {particles.slice(0, 8).map((p, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-pink-400/30 pointer-events-none"
          style={{
            left: `${100 - p.x}%`,
            top: `${100 - p.y}%`,
            fontSize: `${p.size * 2}px`,
          }}
          animate={{
            y: [0, -100],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 0.6, 0],
            rotate: [0, Math.random() * 90 - 45],
          }}
          transition={{
            duration: p.duration * 1.5,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>
      ))}

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Pulsing Heart Logo */}
        <motion.div
          className="relative text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] mb-10"
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -10, 0],
            filter: [
              "drop-shadow(0 0 15px rgba(244,63,94,0.4))",
              "drop-shadow(0 0 30px rgba(244,63,94,0.8))",
              "drop-shadow(0 0 15px rgba(244,63,94,0.4))",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 sm:w-32 sm:h-32">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          
          {/* Inner heart glow */}
          <motion.div 
            className="absolute inset-0 bg-white rounded-full mix-blend-overlay blur-md"
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Loading Text */}
        <div className="h-12 mb-8 w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-lg sm:text-2xl font-medium text-rose-900/70 font-serif italic"
            >
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Stylish Animated Progress Indicator */}
        <div className="w-64 sm:w-80 h-2 bg-white/40 rounded-full overflow-hidden backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] relative">
          <motion.div
            className="h-full bg-linear-to-r from-rose-300 via-purple-300 to-rose-400 rounded-full absolute left-0 top-0"
            style={{ width: `${progress}%` }}
            initial={{ width: "0%" }}
          />
          {/* Glowing dot at the end of progress */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] z-10"
            style={{ left: `calc(${progress}% - 8px)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 0 && progress < 100 ? 1 : 0 }}
          />
        </div>
        
        {/* Progress Percentage */}
        <motion.p 
          className="mt-4 text-sm tracking-widest text-rose-900/40 font-bold"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.round(progress)}%
        </motion.p>
      </div>
    </motion.div>
  );
}
