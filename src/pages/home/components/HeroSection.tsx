import {
  motion,
  useMotionValue,
  useSpring,
  useTime,
  useTransform,
} from 'framer-motion';
import { useState, useRef, useEffect, useId } from 'react';

import MelHeroImage from '../../../assets/mel-keyton-hero2.png';

const BASE_IMAGE = MelHeroImage;
const REVEAL_IMAGE =
  'https://static.readdy.ai/image/37f481326fda0879b2d66b8287a2bda5/e7314a19f58de65bfa37a11681a3b924.png';

const BLOB_SIZE = 320;
const SHAPE_COMPLEXITY = 1.2;
const ROUGHNESS = 0.5;
const SPEED = 300;
const VISCOSITY = 3;
const PARALLAX_STRENGTH = 18;
const BLOB_STROKE_WIDTH = 3;

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function AnimatedCircle({
  cx,
  cy,
  r,
  fill,
  stroke,
  strokeWidth,
}: {
  cx: ReturnType<typeof useSpring> | ReturnType<typeof useTransform>;
  cy: ReturnType<typeof useSpring> | ReturnType<typeof useTransform>;
  r: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const unsubX = cx.on('change', setX);
    const unsubY = cy.on('change', setY);
    return () => { unsubX(); unsubY(); };
  }, [cx, cy]);

  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={fill ?? 'white'}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isActive = isHovering;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- MOUSE & PARALLAX ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXRatio = useMotionValue(0);
  const mouseYRatio = useMotionValue(0);

  const smoothOptions = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseXRatio, smoothOptions);
  const smoothY = useSpring(mouseYRatio, smoothOptions);

  const baseX = useTransform(smoothX, [-1, 1], [PARALLAX_STRENGTH, -PARALLAX_STRENGTH]);
  const baseY = useTransform(smoothY, [-1, 1], [PARALLAX_STRENGTH, -PARALLAX_STRENGTH]);
  const revealX = useTransform(smoothX, [-1, 1], [PARALLAX_STRENGTH, -PARALLAX_STRENGTH]);
  const revealY = useTransform(smoothY, [-1, 1], [PARALLAX_STRENGTH, -PARALLAX_STRENGTH]);

  // --- GLOBAL TRACKING ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const { clientX, clientY } = e;
      const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      setIsHovering(isInside);
      if (isInside) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        mouseX.set(x);
        mouseY.set(y);
        mouseXRatio.set((x / rect.width) * 2 - 1);
        mouseYRatio.set((y / rect.height) * 2 - 1);
      } else {
        mouseXRatio.set(0);
        mouseYRatio.set(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const { clientX, clientY } = e.touches[0];
      const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      setIsHovering(isInside);
      if (isInside) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        mouseX.set(x);
        mouseY.set(y);
        mouseXRatio.set((x / rect.width) * 2 - 1);
        mouseYRatio.set((y / rect.height) * 2 - 1);
      } else {
        mouseXRatio.set(0);
        mouseYRatio.set(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mouseX, mouseY, mouseXRatio, mouseYRatio]);

  // --- FLUID CURSOR PHYSICS ---
  const time = useTime();

  const headX = useSpring(mouseX, { stiffness: SPEED * 1.0, damping: 20, mass: 0.1 });
  const headY = useSpring(mouseY, { stiffness: SPEED * 1.0, damping: 20, mass: 0.1 });
  const body1X = useSpring(mouseX, { stiffness: SPEED * 0.85, damping: 20 + VISCOSITY * 5, mass: 0.2 });
  const body1Y = useSpring(mouseY, { stiffness: SPEED * 0.85, damping: 20 + VISCOSITY * 5, mass: 0.2 });
  const body2X = useSpring(mouseX, { stiffness: SPEED * 0.70, damping: 20 + VISCOSITY * 10, mass: 0.3 });
  const body2Y = useSpring(mouseY, { stiffness: SPEED * 0.70, damping: 20 + VISCOSITY * 10, mass: 0.3 });
  const tailX = useSpring(mouseX, { stiffness: SPEED * 0.40, damping: 20 + VISCOSITY * 20, mass: 0.5 });
  const tailY = useSpring(mouseY, { stiffness: SPEED * 0.40, damping: 20 + VISCOSITY * 20, mass: 0.5 });

  const complexityRadius = BLOB_SIZE * SHAPE_COMPLEXITY * 0.6;
  const roughnessRadius = BLOB_SIZE * ROUGHNESS * 0.4;

  useTransform(time, (t) => headX.get() + Math.sin(t * 0.002) * complexityRadius);
  useTransform(time, (t) => headY.get() + Math.cos(t * 0.002) * complexityRadius);
  useTransform(time, (t) => headX.get() + Math.cos(t * 0.004) * complexityRadius * 0.7);
  useTransform(time, (t) => headY.get() + Math.sin(t * 0.004) * complexityRadius * 0.7);
  useTransform(time, (t) => body1X.get() + Math.sin(t * 0.003 + 1) * roughnessRadius);
  useTransform(time, (t) => body1Y.get() + Math.cos(t * 0.003 + 1) * roughnessRadius);
  useTransform(time, (t) => body2X.get() + Math.cos(t * 0.005 + 2) * roughnessRadius * 0.8);
  useTransform(time, (t) => body2Y.get() + Math.sin(t * 0.005 + 2) * roughnessRadius * 0.8);

  // --- MASK POSITION (for soft radial gradient reveal) ---
  const [maskPos, setMaskPos] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const unsub = headX.on('change', () => {
      setMaskPos({ x: headX.get(), y: headY.get() });
    });
    const unsub2 = headY.on('change', () => {
      setMaskPos({ x: headX.get(), y: headY.get() });
    });
    return () => { unsub(); unsub2(); };
  }, [headX, headY]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[56.25vw] md:min-h-screen flex items-center justify-center overflow-hidden bg-black cursor-none"
      aria-label="Mel Keyton for Georgia State Senate District 28 - Serving the diverse communities of South Fulton, Douglas County, and South Cobb County"
    >
      {/* BASE IMAGE with parallax */}
      <motion.div
        className="absolute inset-0 bg-no-repeat w-full h-full"
        style={{
          backgroundImage: `url(${BASE_IMAGE})`,
          backgroundSize: isMobile ? 'contain' : 'cover',
          backgroundPosition: isMobile ? 'center' : 'center bottom',
          x: baseX,
          y: baseY,
          scale: 1.08,
        }}
        role="img"
        aria-label="Professional African American community leader Mel Keyton representing District 28 tri-county area"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 z-10" />

      {/* REVEAL IMAGE — soft feathered radial gradient mask */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none w-full h-full bg-no-repeat"
        style={{
          backgroundImage: `url(${REVEAL_IMAGE})`,
          backgroundSize: isMobile ? 'contain' : 'cover',
          backgroundPosition: isMobile ? 'center' : 'center bottom',
          x: baseX,
          y: baseY,
          scale: 1.08,
          opacity: isActive ? 1 : 0,
          WebkitMaskImage: `radial-gradient(circle ${BLOB_SIZE / 2}px at ${maskPos.x}px ${maskPos.y}px, black 30%, transparent 100%)`,
          maskImage: `radial-gradient(circle ${BLOB_SIZE / 2}px at ${maskPos.x}px ${maskPos.y}px, black 30%, transparent 100%)`,
          transition: 'opacity 0.3s',
        }}
        role="img"
        aria-label="Mel Keyton engaging with diverse African American community members across South Fulton, Douglas, and Cobb Counties"
      />

      {/* HERO CONTENT */}
      <div className="relative z-40 max-w-7xl mx-auto px-6 lg:px-12 text-center pointer-events-none">
      </div>

      {/* Hover hint */}
      <motion.div className="absolute bottom-12 right-12 z-40 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: isActive ? 0 : 1 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 text-lime/60 text-xs font-medium tracking-widest uppercase">
          <i className="ri-cursor-line text-base"></i>
          Hover to reveal
        </div>
      </motion.div>

      <div className="absolute top-8 right-8 z-40 hidden lg:block pointer-events-auto">
      </div>
    </section>
  );
}