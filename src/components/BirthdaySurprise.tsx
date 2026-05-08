"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";

// Dynamically import Three.js scene to avoid SSR issues
const LoveFinale = dynamic(() => import("./LoveFinale"), { ssr: false });

// Cute Pastel Icons
// Cute Pastel Icons
const GiftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#pastelRose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="pastelRose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fecdd3" />
        <stop offset="100%" stopColor="#fda4af" />
      </linearGradient>
    </defs>
    <rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>
  </svg>
);

const HeartIcon = ({ size = 36, fill = "url(#pastelHeart)" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="none">
    <defs>
      <linearGradient id="pastelHeart" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="100%" stopColor="#f9a8d4" />
      </linearGradient>
    </defs>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const StarIcon = ({ size = 36 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="url(#pastelGold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="pastelGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#fde047" />
      </linearGradient>
    </defs>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default function BirthdaySurprise() {
  const [step, setStep] = useState(1);
  const [showFinale, setShowFinale] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0, isEscaping: false });
  const [floatingShapes] = useState(() => {
    const shapes = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      type: i % 4 === 0 ? 'heart' : i % 4 === 1 ? 'star' : 'blob',
      width: i % 4 === 0 ? 24 : i % 4 === 1 ? 20 : Math.random() * 60 + 30,
      height: i % 4 === 0 ? 24 : i % 4 === 1 ? 20 : Math.random() * 60 + 30,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${i * 1.2}s`,
      opacity: i % 4 === 0 || i % 4 === 1 ? 0.6 : 0.3,
    }));
    return shapes;
  });

  const noButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset "No" button position smoothly when step changes
  useEffect(() => {
    if (noButtonPos.isEscaping) {
        setNoButtonPos({ x: 0, y: 0, isEscaping: false });
    }
  }, [step]);

  // Snappy escape logic using Framer Motion
  const handleNoHover = (e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    // Crucial for mobile: Prevent default behavior and stop propagation
    // This ensures the "No" button doesn't trigger ghost clicks or accidental taps on the "Yes" button
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    
    if (!noButtonRef.current || !modalRef.current) return;
    
    const btn = noButtonRef.current;
    const modal = modalRef.current;

    // Get current dimensions
    const rect = btn.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;

    // Boundary Check: Ensure button stays away from edges
    const screenPadding = 60; 
    const maxTop = window.innerHeight - buttonHeight - screenPadding;
    const maxLeft = window.innerWidth - buttonWidth - screenPadding;
    
    // Target screen coordinates
    const targetScreenTop = Math.max(screenPadding, Math.random() * (maxTop - screenPadding) + screenPadding);
    const targetScreenLeft = Math.max(screenPadding, Math.random() * (maxLeft - screenPadding) + screenPadding);

    // Convert screen coordinates to modal-relative offsets
    const newX = targetScreenLeft - (modalRect.left + modalRect.width / 2);
    const newY = targetScreenTop - (modalRect.top + modalRect.height - 100);

    setNoButtonPos({
        x: newX,
        y: newY,
        isEscaping: true
    });
  };

  const handleYes = () => {
    if (step === 3) {
      triggerFinalCelebration();
      // Delay the finale slightly to let confetti fly
      setTimeout(() => {
        setShowFinale(true);
      }, 1500);
      return;
    }
    setStep(prev => prev + 1);
  };

  const triggerFinalCelebration = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = window.setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffc0cb', '#ffb6c1', '#ff69b4']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffc0cb', '#ffb6c1', '#ff69b4']
      });
    }, 50);

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffc0cb', '#ffb6c1', '#ff69b4', '#fff0f5']
    });
  };

  // Step-specific colors
  const getStepColors = () => {
    switch(step) {
      case 1: return { bg: "bg-[#ffeef2]", blobs: ["bg-[#ffd1dc]", "bg-[#fff0f3]", "bg-[#ffe4e6]"], accent: "text-pink-400" };
      case 2: return { bg: "bg-[#f5efff]", blobs: ["bg-[#e0d1ff]", "bg-[#f0e6ff]", "bg-[#ede9fe]"], accent: "text-purple-400" };
      case 3: return { bg: "bg-[#fff5e6]", blobs: ["bg-[#ffccaa]", "bg-[#fff0e0]", "bg-[#ffedd5]"], accent: "text-orange-400" };
      default: return { bg: "bg-[#fff9fb]", blobs: ["bg-[#ffe4e6]", "bg-[#fdf2f8]", "bg-[#fff7ed]"], accent: "text-pink-400" };
    }
  };

  const colors = getStepColors();

  return (
    <motion.div 
      animate={{ backgroundColor: colors.bg.replace("bg-[", "").replace("]", "") }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans selection:bg-pink-200 transition-colors duration-700"
    >
      <AnimatePresence>
        {showFinale && <LoveFinale key="finale" />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showFinale && (
          <motion.div 
            key="modal-container"
            exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
            transition={{ duration: 1 }}
            className="relative w-full flex items-center justify-center"
          >
            {/* Aesthetic Pastel Mesh Gradient */}
            <div className="absolute inset-0 z-0">
                <motion.div 
                    animate={{ backgroundColor: colors.blobs[0].replace("bg-[", "").replace("]", "") }}
                    className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] opacity-60 transition-colors duration-1000"
                />
                <motion.div 
                    animate={{ backgroundColor: colors.blobs[1].replace("bg-[", "").replace("]", "") }}
                    className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-60 transition-colors duration-1000"
                />
                <motion.div 
                    animate={{ backgroundColor: colors.blobs[2].replace("bg-[", "").replace("]", "") }}
                    className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-40 transition-colors duration-1000"
                />
                
                {/* Glowing Particle Layer */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse pointer-events-none" />

                {/* Cloud-like blobs at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white/40 to-transparent blur-3xl" />
                
                {/* Romantic Floating Shapes */}
                {floatingShapes.map((shape) => (
                    <motion.div 
                        key={shape.id}
                        className="absolute flex items-center justify-center pointer-events-none"
                        animate={{
                            y: [0, -100, 50, 0],
                            x: [0, 40, -40, 0],
                            scale: [1, 1.2, 0.8, 1],
                            rotate: [0, 20, -20, 0],
                            opacity: [shape.opacity, shape.opacity + 0.2, shape.opacity],
                        }}
                        transition={{
                            duration: 12 + Math.random() * 8,
                            repeat: Infinity,
                            delay: parseFloat(shape.animationDelay),
                            ease: "easeInOut"
                        }}
                        style={{
                            left: shape.left,
                            top: shape.top,
                        }}
                    >
                        {shape.type === 'heart' && <HeartIcon size={shape.width} fill="rgba(255,182,193,0.4)" />}
                        {shape.type === 'star' && <StarIcon size={shape.width} />}
                        {shape.type === 'blob' && (
                            <div 
                                className="bg-white/40 rounded-full blur-md"
                                style={{ width: shape.width, height: shape.height }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Compact Aesthetic Modal */}
            <motion.div 
                ref={modalRef}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-[92%] max-w-sm p-8 md:p-10 rounded-[3rem] bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_25px_80px_rgba(0,0,0,0.05)] flex flex-col items-center text-center"
            >
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={step}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* Step Badge */}
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 px-4 py-1.5 rounded-full bg-white/50 border border-white/20 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 ${colors.accent}`}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            Step {step} of 3
                        </motion.div>

                        <motion.div 
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="mb-8 relative"
                        >
                            <div className="absolute inset-0 bg-pink-100/50 blur-3xl rounded-full scale-150"></div>
                            <div className="relative p-6 rounded-[2rem] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-pink-50/50 transform transition-transform hover:rotate-3">
                                {step === 1 && <GiftIcon />}
                                {step === 2 && <HeartIcon size={36} />}
                                {step === 3 && <StarIcon size={36} />}
                            </div>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight text-[#4a3a3d]"
                        >
                            {step === 1 && "Hey! Ready for a surprise?"}
                            {step === 2 && "Are you really sure?"}
                            {step === 3 && "Happy Birthday!"}
                        </motion.h2>

                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base md:text-lg text-[#8a7a7d] mb-10 leading-relaxed max-w-[260px]"
                        >
                            {step === 1 && "I've been waiting all day to share something special with you."}
                            {step === 2 && "This might just make your day even better ❤️"}
                            {step === 3 && "You're someone truly special and you deserve all the happiness ✨"}
                        </motion.p>

                        <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center w-full min-h-[60px]">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleYes}
                                className="group relative flex-[1.5] sm:flex-none sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-[#ff8fa3] to-[#ffb3c1] text-white font-bold text-base transition-all shadow-[0_10px_20px_rgba(255,143,163,0.3)] hover:shadow-[0_15px_30px_rgba(255,143,163,0.4)]"
                            >
                                <span className="relative z-10 whitespace-nowrap">
                                    {step === 1 && "Yes, I'm ready! ❤️"}
                                    {step === 2 && "Yes, show me! ❤️"}
                                    {step === 3 && "Aww, thank you! ❤️"}
                                </span>
                            </motion.button>
                            
                            {/* Smooth Escaping No Button */}
                            <motion.button
                                ref={noButtonRef}
                                animate={{ 
                                    x: noButtonPos.x, 
                                    y: noButtonPos.y,
                                    position: noButtonPos.isEscaping ? "fixed" : "static",
                                    width: noButtonPos.isEscaping ? "120px" : "auto" // Maintain width when escaping
                                }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 400, 
                                    damping: 30,
                                }}
                                onMouseEnter={handleNoHover}
                                onTouchStart={handleNoHover}
                                onClick={handleNoHover}
                                className="flex-1 sm:flex-none sm:px-10 py-4 rounded-2xl bg-white border border-[#f3e8ea] text-[#d1b9be] font-bold text-base transition-colors cursor-default select-none pointer-events-auto shadow-sm z-[9999]"
                                style={{
                                    zIndex: noButtonPos.isEscaping ? 9999 : 1
                                }}
                            >
                                No
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body {
            background-color: #fff9fb;
            margin: 0;
            padding: 0;
        }
      `}</style>
    </motion.div>
  );
}
