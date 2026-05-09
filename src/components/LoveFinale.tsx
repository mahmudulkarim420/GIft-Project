"use client";

import React, { useRef, useMemo, useEffect, useState, memo } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

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
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    // Use passive listener for better scroll performance
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return mobile;
}

// ─── Heart-shaped particle system ─────────────────────────────────────────
const HeartParticles = memo(function HeartParticles({ count }: { count: number }) {
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
      <Points ref={ref} positions={positions} stride={3} frustumCulled={true}>
        <PointMaterial
          transparent
          vertexColors={false}
          color="#ff6eb4"
          size={0.07}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </Points>

      {/* Ambient sparkle cloud */}
      <Points ref={trailRef} positions={dustPositions} stride={3} frustumCulled={true}>
        <PointMaterial
          transparent
          color="#c084fc"
          size={0.025}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </Points>
    </group>
  );
});

// ─── Bokeh background layer ────────────────────────────────────────────────
const BokehLayer = memo(function BokehLayer() {
  const ref = useRef<THREE.Points>(null);
  const count = 150; // Reduced for performance

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
    <Points ref={ref} positions={positions} stride={3} frustumCulled={true}>
      <PointMaterial
        transparent
        color="#e879f9"
        size={0.12}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.2}
      />
    </Points>
  );
});

// ─── 3D Scene ─────────────────────────────────────────────────────────────
const Scene = memo(function Scene({ particleCount }: { particleCount: number }) {
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
      <pointLight position={[0, 3, 3]} intensity={1.5} color="#ff6eb4" />
      <pointLight position={[-4, -2, 2]} intensity={0.8} color="#818cf8" />
      <pointLight position={[4, -2, 2]} intensity={0.8} color="#e879f9" />

      <BokehLayer />
      <group ref={groupRef}>
        <HeartParticles count={particleCount} />
      </group>
    </>
  );
});

// ─── Floating CSS heart particle ──────────────────────────────────────────
const FloatingHeart = memo(function FloatingHeart({ delay, left, size }: { delay: number; left: string; size: number }) {
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ left, bottom: "-10%", fontSize: size, willChange: "transform, opacity" }}
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
});

// ─── Gift Card Data ────────────────────────────────────────────────────────
const giftCards = [
  {
    id: 1,
    icon: "💌",
    title: "Happy Birthday, My srissy ❤️",
    message:
      `Its your 2nd birthday together, and you still make my world brighter every day. You're my best supporter, I’m so lucky to have you. Love you always 🎂✨`,
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffecd2 100%)",
    glowColor: "#ff6eb4",
    border: "rgba(255,110,180,0.35)",
    floatDelay: 0,
    decorations: ["✨", "🌸", "💫"],
    animY: [-6, 6, -6],
    rotateAnim: [-1, 1, -1],
  },
  {
    id: 2,
    icon: "🌷",
    title: "To My Pasandida Aurat ❤️",
    message:
      `Being with you has made my life happier, calmer, and more beautiful. Every moment with you feels special, and I’m truly grateful to have you beside me. Thank you for all the love, care, and smiles you give me every day. No matter what happens, I always want to stay by your side and make more memories with you. You are not just my girlfriend, you are my peace, my happiness, and my favorite person. I love you so much. 💖`,
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 50%, #d4a8ff 100%)",
    glowColor: "#c084fc",
    border: "rgba(192,132,252,0.35)",
    floatDelay: 0.4,
    decorations: ["🌙", "⭐", "💜"],
    animY: [-8, 4, -8],
    rotateAnim: [1, -1, 1],
  },
  {
    id: 3,
    icon: "🎀",
    title: "শুনো.......Srisss bliss",
    message:
      "বিয়া তোরেই করুম গুন্ডি... 🙄😌",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)",
    glowColor: "#f093fb",
    border: "rgba(240,147,251,0.35)",
    floatDelay: 0.8,
    decorations: ["🌟", "🎀", "✨"],
    animY: [-5, 7, -5],
    rotateAnim: [-1.5, 1.5, -1.5],
  },
];

// ─── Ambient Sparkle Particle ──────────────────────────────────────────────
const SparkleParticle = memo(function SparkleParticle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-xs"
      style={{ left: x, top: y, willChange: "transform, opacity" }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [0, -30, -60] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
    >
      ✨
    </motion.div>
  );
});

// ─── Gift Card Component ───────────────────────────────────────────────────
function GiftCard({ card, index }: { card: typeof giftCards[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.2 + 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      animate={{ y: card.animY, rotate: card.rotateAnim }}
      whileHover={{ scale: 1.05, rotate: 0 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1.5px solid ${card.border}`,
        borderRadius: "24px",
        backdropFilter: "blur(12px)", // Reduced blur for performance
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: hovered
          ? `0 0 30px ${card.glowColor}44, 0 16px 40px rgba(0,0,0,0.3)`
          : `0 0 15px ${card.glowColor}11, 0 8px 24px rgba(0,0,0,0.2)`,
        transition: "box-shadow 0.4s ease, transform 0.4s ease",
        willChange: "transform, box-shadow",
        position: "relative",
        overflow: "hidden",
        flex: "1 1 280px",
        maxWidth: "340px",
        minWidth: "260px",
        cursor: "default",
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.12,
          background: card.gradient, borderRadius: "24px",
          transition: "opacity 0.4s",
        }}
      />

      {/* Glow pulse ring */}
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.05, 1] }}
        transition={{ duration: 3 + index, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: "-2px", borderRadius: "26px",
          background: `radial-gradient(ellipse at 50% 0%, ${card.glowColor}33, transparent 70%)`,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      />

      {/* Decorative floating emojis */}
      {card.decorations.map((emoji, ei) => (
        <motion.span
          key={ei}
          animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5 + ei * 0.7, repeat: Infinity, delay: ei * 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: ei === 0 ? "10px" : ei === 1 ? "16px" : "12px",
            right: ei === 0 ? "14px" : ei === 1 ? "44px" : "74px",
            fontSize: "14px", pointerEvents: "none", filter: `drop-shadow(0 0 6px ${card.glowColor})`,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Card Content */}
      <div style={{ padding: "32px 28px 28px", position: "relative", zIndex: 1 }}>
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.4, ease: "easeInOut" }}
          style={{
            fontSize: "3rem", lineHeight: 1, marginBottom: "16px",
            filter: `drop-shadow(0 0 16px ${card.glowColor})`,
            display: "inline-block",
          }}
        >
          {card.icon}
        </motion.div>

        {/* Title */}
        <h3 style={{
          fontSize: "1.15rem", fontWeight: 700, marginBottom: "14px",
          background: card.gradient, WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent", backgroundClip: "text",
          textShadow: "none", letterSpacing: "0.02em",
          fontFamily: "'Georgia', serif",
        }}>
          {card.title}
        </h3>

        {/* Divider */}
        <div style={{
          height: "1px", marginBottom: "14px",
          background: `linear-gradient(90deg, transparent, ${card.glowColor}66, transparent)`,
        }} />

        {/* Message */}
        <p style={{
          fontSize: "0.88rem", lineHeight: 1.75, color: "rgba(255,220,240,0.88)",
          fontFamily: "'Georgia', serif", fontStyle: "italic",
        }}>
          {card.message}
        </p>

        {/* Bottom glow bar */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
          style={{
            height: "3px", borderRadius: "99px", marginTop: "20px",
            background: card.gradient,
            boxShadow: `0 0 12px ${card.glowColor}`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Gift Notes Section ────────────────────────────────────────────────────
const GiftNotesSection = memo(function GiftNotesSection() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({ // Reduced from 20 to 12
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        delay: i * 0.3,
      })),
    []
  );

  return (
    <section
      style={{
        position: "relative", width: "100%", paddingTop: "80px",
        paddingBottom: "80px", overflow: "hidden",
        background: "linear-gradient(180deg, transparent 0%, rgba(20,0,40,0.85) 20%, rgba(10,0,25,0.95) 100%)",
        zIndex: 20,
      }}
    >
      {/* Ambient sparkles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {sparkles.map((s) => (
          <SparkleParticle key={s.id} x={s.x} y={s.y} delay={s.delay} />
        ))}
      </div>

      {/* Soft glow blobs */}
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: "80vw", height: "40vh", borderRadius: "50%",
        // Removed heavy filter: blur() and used a softer gradient
        background: "radial-gradient(ellipse, rgba(255, 110, 180, 0.15) 0%, rgba(255, 110, 180, 0.05) 40%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Section Heading */}
      <div style={{ textAlign: "center", marginBottom: "56px", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              display: "inline-block", fontSize: "clamp(0.65rem, 2vw, 0.85rem)",
              letterSpacing: "0.35em", textTransform: "uppercase",
              color: "#e9a8d4", marginBottom: "12px",
              textShadow: "0 0 12px #ff6eb488",
            }}
          >
            ✦ Just For You ✦
          </motion.span>

          <motion.h2
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
              fontWeight: 800,
              fontFamily: "'Georgia', serif",
              color: "#fff",
              textShadow: "0 0 30px #ff6eb4, 0 0 80px #ff6eb488, 0 0 140px #c084fc44",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Special Gifts For You 💝
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              marginTop: "14px", fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
              color: "rgba(233,168,212,0.75)", letterSpacing: "0.1em",
              fontStyle: "italic", fontFamily: "'Georgia', serif",
            }}
          >
            Three little notes of infinite love 🌸
          </motion.p>
        </motion.div>
      </div>

      {/* Cards Row */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: "24px", padding: "0 clamp(16px, 4vw, 48px)",
          position: "relative", zIndex: 1,
        }}
      >
        {giftCards.map((card, i) => (
          <GiftCard key={card.id} card={card} index={i} />
        ))}
      </div>

      {/* Bottom ribbon */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: "60px auto 0", height: "2px", maxWidth: "320px",
          background: "linear-gradient(90deg, transparent, #ff6eb4, #c084fc, #ff6eb4, transparent)",
          borderRadius: "99px", boxShadow: "0 0 20px #ff6eb488",
        }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 1 }}
        style={{
          textAlign: "center", marginTop: "20px",
          fontSize: "1.6rem", filter: "drop-shadow(0 0 8px #ff6eb4)",
        }}
      >
        💗 💜 💗
      </motion.p>
    </section>
  );
});

// ─── Main LoveFinale Component ─────────────────────────────────────────────
export default function LoveFinale() {
  const isMobile = useIsMobile();
  // Reduced particle counts for mobile to maintain 60 FPS
  const particleCount = isMobile ? 800 : 2500;
  
  // Delay mounting heavy Canvas elements to allow Framer Motion transitions to complete smoothly
  const [mountCanvas, setMountCanvas] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMountCanvas(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const floatingHearts = useMemo(
    () =>
      Array.from({ length: isMobile ? 8 : 15 }, (_, i) => ({
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
      className="fixed inset-0 z-[200]"
      style={{
        overflowY: "auto",
        overflowX: "hidden",
        background: "radial-gradient(ellipse at 50% 60%, #1a003a 0%, #0d001f 50%, #050008 100%)",
      }}
    >
      {/* ── Hero Section (full viewport) ──────────────────────────────── */}
      <div style={{ position: "relative", width: "100%", minHeight: "100vh", flexShrink: 0 }}>
        {/* ── Ambient gradient glow layers ─────────────────────────────── */}
        {/* Removed CSS blur() on large elements as it causes huge layout/paint thrashing on scroll. Used soft gradients instead. */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full opacity-40"
            style={{ background: "radial-gradient(ellipse, rgba(255, 110, 180, 0.4) 0%, rgba(255, 110, 180, 0.1) 40%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vh] rounded-full opacity-30"
            style={{ background: "radial-gradient(ellipse, rgba(129, 140, 248, 0.4) 0%, rgba(129, 140, 248, 0.1) 40%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[15%] right-[10%] w-[45vw] h-[45vh] rounded-full opacity-30"
            style={{ background: "radial-gradient(ellipse, rgba(232, 121, 249, 0.4) 0%, rgba(232, 121, 249, 0.1) 40%, transparent 70%)" }}
          />
        </div>

        {/* ── Three.js canvas ──────────────────────────────────────────── */}
        {mountCanvas && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1.5 }} 
            className="absolute inset-0 pointer-events-none"
          >
            <Canvas
              dpr={[1, isMobile ? 1 : 1.5]} // Capped DPR for mobile performance
              camera={{ position: [0, 0, 6], fov: isMobile ? 65 : 55 }}
              gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
              style={{ position: "absolute", inset: 0 }}
            >
              <Scene particleCount={particleCount} />
            </Canvas>
          </motion.div>
        )}

        {/* ── Floating heart particles (CSS layer) ─────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingHearts.map((h) => (
            <FloatingHeart key={h.id} delay={h.delay} left={h.left} size={h.size} />
          ))}
        </div>

        {/* ── Central text overlay ─────────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center font-bold leading-tight tracking-tight px-4"
            style={{
              fontSize: "clamp(2.2rem, 8vw, 5rem)",
              color: "#fff",
              textShadow: "0 0 20px #ff6eb4, 0 0 60px #ff6eb4aa, 0 0 120px #e879f944",
            }}
          >
            I Love You Srissy❤️
          </motion.h1>

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

          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-8 text-4xl md:text-5xl"
            style={{ filter: "drop-shadow(0 0 12px #ff6eb4)" }}
          >
            💗
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
            transition={{ delay: 3.5, duration: 2, repeat: Infinity }}
            style={{
              position: "absolute", bottom: "32px",
              fontSize: "0.75rem", color: "#e9a8d488",
              letterSpacing: "0.2em", textTransform: "uppercase",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
            }}
          >
            <span>Scroll for gifts</span>
            <span style={{ fontSize: "1.2rem" }}>↓</span>
          </motion.div>
        </div>

        {/* ── Cinematic vignette ──────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,0,8,0.7) 100%)",
          }}
        />
      </div>

      {/* ── Gift Notes Section ────────────────────────────────────────── */}
      <GiftNotesSection />
    </motion.div>
  );
}
