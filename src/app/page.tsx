"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import BirthdaySurprise from "@/components/BirthdaySurprise";
import LoadingScreen from "@/components/LoadingScreen";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="relative min-h-screen bg-[#fff9fb] overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      
      {!isLoading && (
        <>
          <AudioPlayer />
          <BirthdaySurprise />
        </>
      )}
    </main>
  );
}
