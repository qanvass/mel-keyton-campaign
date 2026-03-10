import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useRef, useState, useEffect } from 'react';

const placeholderSlots = Array.from({ length: 6 });

export default function PartnersSection() {
  const { ref: inViewRef, isInView } = useInView({ threshold: 0.3 });
  const containerRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const mobileY1 = useTransform(scrollYProgress, [0, 0.4], [100, 0]);
  const mobileOpacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0.5, 1]);

  const mobileScale2 = useTransform(scrollYProgress, [0.3, 0.6], [0.8, 1]);
  const mobileOpacity2 = useTransform(scrollYProgress, [0.2, 0.5, 0.6], [0, 0.5, 1]);

  const mobileY3 = useTransform(scrollYProgress, [0.4, 0.8], [100, 0]);
  const mobileOpacity3 = useTransform(scrollYProgress, [0.3, 0.6, 0.8], [0, 0.5, 1]);

  return (
    <section ref={containerRef} className="py-32 bg-white overflow-hidden relative">
      <div ref={inViewRef as React.RefObject<HTMLDivElement>} className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={!isMobile && isInView ? { opacity: 1, y: 0 } : {}}
          style={isMobile ? { y: mobileY1, opacity: mobileOpacity1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-display text-dark-green mb-6">
            Endorsements
            <br />
            <span className="text-lime">Coming Soon</span>
          </h2>
          <p className="text-lg text-dark-green-tint-1 max-w-2xl">
            Mel Keyton is building a broad coalition of community leaders, organizations, and advocates
            committed to progress and a stronger Georgia for all families. Endorsements are on the way.
          </p>
        </motion.div>

        {/* Placeholder grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {placeholderSlots.map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={!isMobile && isInView ? { opacity: 1, scale: 1 } : {}}
              style={isMobile ? { scale: mobileScale2, opacity: mobileOpacity2 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-24 rounded-xl border-2 border-dashed border-dark-green/15 flex flex-col items-center justify-center gap-2 bg-gray-50/60"
            >
              <div className="w-8 h-8 flex items-center justify-center text-dark-green/25">
                <i className="ri-award-line text-2xl"></i>
              </div>
              <span className="text-xs font-medium text-dark-green/30 tracking-widest uppercase">Soon</span>
            </motion.div>
          ))}
        </div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={!isMobile && isInView ? { opacity: 1, y: 0 } : {}}
          style={isMobile ? { y: mobileY3, opacity: mobileOpacity3 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative rounded-2xl bg-dark-green overflow-hidden px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-lime/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-lime/10 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest uppercase text-lime mb-2">Want to Endorse Mel?</p>
            <h3 className="text-3xl font-display text-white leading-tight">
              Your organization's support<br />makes a difference.
            </h3>
          </div>

          <a
            href="mailto:votemelkeyton@gmail.com?subject=Endorsement%20Inquiry"
            className="relative z-10 flex-shrink-0 px-8 py-3.5 bg-lime text-dark-green text-sm font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap"
          >
            Reach Out to Endorse
          </a>
        </motion.div>
      </div>
    </section>
  );
}
