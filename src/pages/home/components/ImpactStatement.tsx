import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useEffect, useState, useRef } from 'react';

export default function ImpactStatement() {
  const { ref: inViewRef, isInView } = useInView({ threshold: 0.3 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const mobileY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const mobileOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const mobileScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <section id="impact" ref={containerRef} className="py-32 bg-white overflow-hidden relative">
      <div ref={inViewRef as React.RefObject<HTMLDivElement>} className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={!isMobile && isInView ? { opacity: 1, y: 0 } : {}}
          style={isMobile ? { y: mobileY, opacity: mobileOpacity, scale: mobileScale } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center">
              <i className="ri-trophy-line text-3xl text-lime"></i>
            </div>
            <span className="text-sm font-medium text-dark-green-tint-1 uppercase tracking-wider">
              Candidate for Georgia State Senate District 28
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display text-dark-green leading-tight mb-8">
            <strong className="text-lime">Protecting</strong> family wealth, fighting for{' '}
            <strong className="text-lime">working families</strong>, and applying an Engineer&apos;s Mindset
            <br />
            to fix broken systems — defining a <strong className="text-lime">legacy</strong> of Good Trouble across the diverse, professional communities of District 28&apos;s tri-county region.
          </h2>

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="text-center max-w-[160px]">
              <p className="text-4xl font-display text-lime mb-1">20+</p>
              <p className="text-sm text-dark-green-tint-1 uppercase tracking-wider">Years of Engineering &amp; Leadership</p>
            </div>
            <div className="w-px bg-dark-green/10 hidden md:block"></div>
            <div className="text-center max-w-[160px]">
              <p className="text-4xl font-display text-lime mb-1">3</p>
              <p className="text-sm text-dark-green-tint-1 uppercase tracking-wider">Counties: South Cobb, Douglas &amp; South Fulton</p>
            </div>
            <div className="w-px bg-dark-green/10 hidden md:block"></div>
            <div className="text-center max-w-[160px]">
              <p className="text-4xl font-display text-lime mb-1">7</p>
              <p className="text-sm text-dark-green-tint-1 uppercase tracking-wider">Cities Served Across District 28</p>
            </div>
            <div className="w-px bg-dark-green/10 hidden md:block"></div>
            <div className="text-center max-w-[160px]">
              <p className="text-4xl font-display text-lime mb-1">D28</p>
              <p className="text-sm text-dark-green-tint-1 uppercase tracking-wider">Western Metro Atlanta&apos;s New Footprint</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}