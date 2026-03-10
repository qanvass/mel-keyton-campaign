import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-green/95 backdrop-blur-md' : 'bg-transparent'
          }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-2xl font-display tracking-wider text-lime hover:opacity-80 transition-opacity cursor-pointer">
            D28
            <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-white/50 border border-white/20 rounded-full px-2 py-0.5 leading-none whitespace-nowrap">
              Independent Democrat
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-white hover:text-lime transition-colors cursor-pointer whitespace-nowrap">
              Home
            </a>
            <a href="#impact" className="text-sm font-medium text-white hover:text-lime transition-colors cursor-pointer whitespace-nowrap">
              Community
            </a>
            <a href="#priorities" className="text-sm font-medium text-white hover:text-lime transition-colors cursor-pointer whitespace-nowrap">
              Priorities
            </a>
            <a href="#campaign-events" className="text-sm font-medium text-white hover:text-lime transition-colors cursor-pointer whitespace-nowrap">
              Volunteer
            </a>
            <a href="/admin/login" className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-login-box-line"></i> Staff Login
            </a>
            <a
              href="#donate"
              className="px-6 py-2.5 bg-lime text-white text-sm font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap"
            >
              Chip In
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-lime cursor-pointer"
            aria-label="Toggle menu"
          >
            <i className={`ri-${menuOpen ? 'close' : 'menu'}-line text-2xl`}></i>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-dark-green lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <a
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-display text-white hover:text-lime transition-colors cursor-pointer"
              >
                Home
              </a>
              <a
                href="#impact"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-display text-white hover:text-lime transition-colors cursor-pointer"
              >
                Community
              </a>
              <a
                href="#priorities"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-display text-white hover:text-lime transition-colors cursor-pointer"
              >
                Priorities
              </a>
              <a
                href="#campaign-events"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-display text-white hover:text-lime transition-colors cursor-pointer"
              >
                Volunteer
              </a>
              <a
                href="/admin/login"
                className="text-3xl font-display text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              >
                <i className="ri-login-box-line"></i> Staff Login
              </a>
              <a
                href="#donate"
                onClick={() => setMenuOpen(false)}
                className="px-8 py-3 bg-lime text-dark-green text-lg font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap mt-4"
              >
                Donate to D28
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
