"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Extend JSX to support R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// ─── Detect mobile for adaptive particle count ─────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);
  return mobile;
}

// ─── Heart-shaped particle system ─────────────────────────────────────────
function HeartParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const trailRef = useRef<THREE.Points>(null);

  // Generate parametric heart shape positions
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 0.12;

      // Heart parametric equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

      const scale = 0.16;
      pos[i * 3]     = x * scale + spread;
      pos[i * 3 + 1] = y * scale + spread + 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      // Color gradient: pink → magenta → purple
      const ratio = i / count;
      col[i * 3]     = 1.0;
      col[i * 3 + 1] = 0.3 + ratio * 0.3;
      col[i * 3 + 2] = 0.4 + ratio * 0.6;
    }
    return { positions: pos, colors: col };
  }, [count]);

  // Ambient dust sparkles behind the heart
  const dustPositions = useMemo(() => {
    const n = Math.floor(count * 0.4);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (ref.current) {
      // Heartbeat pulse
      const pulse = 1 + Math.sin(t * 1.4) * 0.06;
      ref.current.scale.set(pulse, pulse, pulse);
      // Gentle float rotation
      ref.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      ref.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    }

    if (trailRef.current) {
      trailRef.current.rotation.y = t * 0.05;
      trailRef.current.rotation.x = t * 0.03;
    }
  });

  return (
    <group>
      {/* Heart outline */}
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors={false}
          color="#ff6eb4"
          size={0.07}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.95}
        />
      </Points>

      {/* Ambient sparkle cloud */}
      <Points ref={trailRef} positions={dustPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#c084fc"
          size={0.025}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.5}
        />
      </Points>
    </group>
  );
}

// ─── Bokeh background layer ────────────────────────────────────────────────
function BokehLayer() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.01;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.008) * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#e879f9"
        size={0.12}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.25}
      />
    </Points>
  );
}

// ─── 3D Scene ─────────────────────────────────────────────────────────────
function Scene({ particleCount }: { particleCount: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, mouse }) => {
    if (groupRef.current) {
      // Subtle parallax tracking mouse
      groupRef.current.rotation.y += (mouse.x * 0.3 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (-mouse.y * 0.15 - groupRef.current.rotation.x) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#ff80b5" />
      <pointLight position={[0, 3, 3]} intensity={2} color="#ff6eb4" />
      <pointLight position={[-4, -2, 2]} intensity={1} color="#818cf8" />
      <pointLight position={[4, -2, 2]} intensity={1} color="#e879f9" />

      <BokehLayer />
      <group ref={groupRef}>
        <HeartParticles count={particleCount} />
      </group>
    </>
  );
}

// ─── Floating CSS heart particle ──────────────────────────────────────────
function FloatingHeart({ delay, left, size }: { delay: number; left: string; size: number }) {
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ left, bottom: "-10%", fontSize: size }}
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: [0, -(window.innerHeight * 1.3)],
        opacity: [0, 0.6, 0.6, 0],
        scale: [0.5, 1, 1, 0.8],
        x: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      ❤️
    </motion.div>
  );
}

// ─── Main LoveFinale Component ─────────────────────────────────────────────
export default function LoveFinale() {
  const isMobile = useIsMobile();
  const particleCount = isMobile ? 1800 : 5000;

  const floatingHearts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        delay: i * 1.1,
        left: `${4 + Math.random() * 92}%`,
        size: 10 + Math.random() * 16,
      })),
    []
  );

  return (
    <motion.div
      key="love-finale"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #1a003a 0%, #0d001f 50%, #050008 100%)",
      }}
    >
      {/* ── Ambient gradient glow layers ───────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] rounded-full opacity-30 blur-[100px]"
          style={{ background: "radial-gradient(circle, #ff6eb4, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vh] rounded-full opacity-20 blur-[80px]"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[15%] right-[10%] w-[35vw] h-[35vh] rounded-full opacity-20 blur-[80px]"
          style={{ background: "radial-gradient(circle, #e879f9, transparent 70%)" }}
        />
      </div>

      {/* ── Three.js canvas ────────────────────────────────────────────── */}
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ position: [0, 0, 6], fov: isMobile ? 65 : 55 }}
        gl={{ antialias: !isMobile, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene particleCount={particleCount} />
      </Canvas>

      {/* ── Floating heart particles (CSS layer) ──────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingHearts.map((h) => (
          <FloatingHeart key={h.id} delay={h.delay} left={h.left} size={h.size} />
        ))}
      </div>

      {/* ── Central text overlay ──────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.2, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-bold leading-tight tracking-tight px-4"
          style={{
            fontSize: "clamp(2.2rem, 8vw, 5rem)",
            color: "#fff",
            textShadow:
              "0 0 20px #ff6eb4, 0 0 60px #ff6eb4aa, 0 0 120px #e879f944",
          }}
        >
          I Love You Srissy❤️
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1.2 }}
          className="mt-4 text-center tracking-[0.25em] uppercase px-6"
          style={{
            fontSize: "clamp(0.65rem, 2.5vw, 1rem)",
            color: "#e9a8d4",
            textShadow: "0 0 12px #ff6eb466",
            letterSpacing: "0.3em",
          }}
        >
          Forever & Always · With All My Heart
        </motion.p>

        {/* Floating heart pulse below text */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8 text-4xl md:text-5xl"
          style={{ filter: "drop-shadow(0 0 12px #ff6eb4)" }}
        >
          💗
        </motion.div>
      </div>

      {/* ── Bottom cinematic vignette ────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,0,8,0.7) 100%)",
        }}
      />
    </motion.div>
  );
}
