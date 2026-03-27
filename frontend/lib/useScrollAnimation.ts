"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Scroll-based animation hook with velocity-sensitive effects.
 * 
 * Features:
 * - Subtle parallax/movement effects during scrolling
 * - Velocity-based intensity (faster scroll = more pronounced effects)
 * - Minimal displacement (2-8 pixels max)
 * - Very short animation duration with eased curves
 * - Stops completely when scrolling stops
 * - No layout shifts
 */
export function useScrollAnimation(options: {
  /** Maximum pixel displacement */
  maxDisplacement?: number;
  /** Spring stiffness */
  stiffness?: number;
  /** Spring damping */
  damping?: number;
  /** Enable horizontal movement */
  enableX?: boolean;
  /** Enable vertical movement */
  enableY?: boolean;
} = {}) {
  const {
    maxDisplacement = 6,
    stiffness = 400,
    damping = 30,
    enableX = false,
    enableY = true,
  } = options;

  const scrollY = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  const velocity = useMotionValue(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(0);

  // Transform scrollY to subtle offset with spring physics
  const springConfig = {
    stiffness,
    damping,
    restSpeed: 0.01,
    restDelta: 0.01,
  };

  // Y offset - very subtle
  const yOffset = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, maxDisplacement]),
    springConfig
  );

  // X offset - very subtle (if enabled)
  const xOffset = useSpring(
    useTransform(scrollYProgress, [0, 1], enableX ? [0, maxDisplacement * 0.5] : [0, 0]),
    springConfig
  );

  // Velocity-based scale effect - very subtle
  const velocityScale = useSpring(
    useTransform(velocity, [-2000, 0, 2000], [0.98, 1, 0.98]),
    { stiffness: 500, damping: 40 }
  );

  // Velocity-based opacity effect - barely perceptible
  const velocityOpacity = useSpring(
    useTransform(velocity, [-3000, 0, 3000], [0.95, 1, 0.95]),
    { stiffness: 400, damping: 50 }
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const now = performance.now();
      
      // Calculate velocity
      const deltaTime = Math.max(now - lastTime.current, 1);
      const deltaScroll = currentScrollY - lastScrollY.current;
      const rawVelocity = (deltaScroll / deltaTime) * 1000; // pixels per second
      
      velocity.set(rawVelocity);
      scrollY.set(currentScrollY);
      
      // Update scroll progress (normalized 0-1 based on page height)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? currentScrollY / maxScroll : 0;
      scrollYProgress.set(progress);
      
      lastScrollY.current = currentScrollY;
      lastTime.current = now;
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial read

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollY, scrollYProgress, velocity]);

  return {
    y: enableY ? yOffset : useMotionValue(0),
    x: enableX ? xOffset : useMotionValue(0),
    velocityScale,
    velocityOpacity,
    scrollY,
    scrollYProgress,
  };
}

/**
 * Creates a subtle scroll-linked animation for a container.
 * Use this for page-level scroll effects.
 */
export function ScrollReveal({
  children,
  className,
  displacement = 4,
}: {
  children: React.ReactNode;
  className?: string;
  displacement?: number;
}) {
  const { y, velocityOpacity } = useScrollAnimation({
    maxDisplacement: displacement,
    enableY: true,
  });

  return (
    <motion.div
      style={{ y, opacity: velocityOpacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Sticky header that subtly shifts during scroll.
 * Only activates during active scrolling with velocity sensitivity.
 */
export function ScrollHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { y, velocityScale } = useScrollAnimation({
    maxDisplacement: 2,
    stiffness: 500,
    damping: 35,
  });

  return (
    <motion.div
      style={{ y, scale: velocityScale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card that subtly lifts during scroll based on velocity.
 */
export function ScrollCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { velocityScale, velocityOpacity } = useScrollAnimation({
    maxDisplacement: 3,
    stiffness: 450,
    damping: 35,
  });

  return (
    <motion.div
      style={{ 
        scale: velocityScale,
        opacity: velocityOpacity,
      }}
      transition={{ duration: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
