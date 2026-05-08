"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fadeIn = () => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    
    audioRef.current.volume = 0;
    let vol = 0;
    fadeIntervalRef.current = setInterval(() => {
      if (vol < 0.5) {
        vol += 0.05;
        if (audioRef.current) {
          audioRef.current.volume = Math.min(vol, 0.5);
        }
      } else {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, 200);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attemptPlay = async () => {
      try {
        audio.volume = 0;
        await audio.play();
        setIsPlaying(true);
        fadeIn();
      } catch (error) {
        console.log("Autoplay blocked, waiting for user interaction...");
        setIsPlaying(false);
      }
    };

    attemptPlay();

    const handleUserInteraction = async () => {
      if (!isPlaying && audioRef.current) {
        try {
          audioRef.current.volume = 0;
          await audioRef.current.play();
          setIsPlaying(true);
          fadeIn();
          removeListeners();
        } catch (e) {
          // Still blocked
        }
      }
    };

    const removeListeners = () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("pointerdown", handleUserInteraction);

    return () => {
      removeListeners();
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isPlaying]);

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      if (!newMutedState && !isPlaying) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          fadeIn();
        }).catch(() => {});
      }
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/music.mpeg" 
        loop 
        preload="auto"
        className="hidden"
      />
      
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMute();
          }}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-pink-100 flex items-center justify-center text-rose-400 hover:text-rose-500 hover:bg-white transition-colors"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <div className="relative flex items-center justify-center">
              {isPlaying && (
                 <motion.div 
                   className="absolute inset-0 rounded-full border border-rose-300"
                   animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                 />
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </div>
          )}
        </motion.button>
      </AnimatePresence>
    </>
  );
}
