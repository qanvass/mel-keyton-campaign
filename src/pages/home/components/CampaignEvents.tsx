import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { API_BASE_URL } from '@/config';

const events = [
  {
    id: 1,
    title: 'Campaign Rally — District 28',
    location: 'South Fulton & Douglas County',
    time: 'Dates Coming Soon',
    type: 'Rally',
    color: 'bg-lime',
    icon: 'ri-megaphone-line',
  },
  {
    id: 2,
    title: 'Neighborhood Canvassing Drive',
    location: 'Douglasville, GA',
    time: 'Dates Coming Soon',
    type: 'Canvassing',
    color: 'bg-lime/70',
    icon: 'ri-walk-line',
  },
  {
    id: 3,
    title: 'Phone Banking for District 28',
    location: 'Campaign HQ, South Fulton, GA',
    time: 'Dates Coming Soon',
    type: 'Phone Bank',
    color: 'bg-lime',
    icon: 'ri-phone-line',
  },
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function CampaignEvents() {
  const { ref: inViewRef, isInView } = useInView({ threshold: 0.2 });
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

  const mobileY1 = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const mobileOpacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 0.5, 1]);

  const mobileX2 = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);
  const mobileOpacity2 = useTransform(scrollYProgress, [0.1, 0.4, 0.5], [0, 0.5, 1]);

  const mobileScale3 = useTransform(scrollYProgress, [0.4, 0.7], [0.9, 1]);
  const mobileOpacity3 = useTransform(scrollYProgress, [0.3, 0.6, 0.7], [0, 0.5, 1]);

  const [formState, setFormState] = useState<FormState>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setFormState('submitting');

    try {
      const res = await fetch(`${API_BASE_URL}/api/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormState('success');
        setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  return (
    <section id="campaign-events" ref={containerRef} className="py-32 bg-[#f7f9f4] relative overflow-hidden">
      <div ref={inViewRef as React.RefObject<HTMLDivElement>} className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={!isMobile && isInView ? { opacity: 1, y: 0 } : {}}
          style={isMobile ? { y: mobileY1, opacity: mobileOpacity1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <span className="inline-block px-4 py-2 bg-lime/10 border border-lime text-lime text-sm font-medium rounded-full mb-6 uppercase tracking-wider">
            Get Involved
          </span>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-display text-dark-green leading-tight mb-6">
            Campaign Trail
            <br />
            <span className="text-lime">&amp; Volunteer</span>
          </h2>
          <p className="text-lg text-dark-green-tint-1 max-w-2xl">
            Join Mel Keyton on the campaign trail across District 28 — from Mableton and Austell in South Cobb, to Douglasville and Lithia Springs in Douglas County, to South Fulton and Chattahoochee Hills. Every door knocked, every call made, and every event attended brings us closer to real change for Georgia families.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Events List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={!isMobile && isInView ? { opacity: 1, x: 0 } : {}}
            style={isMobile ? { x: mobileX2, opacity: mobileOpacity2 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex gap-5 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Icon Badge */}
                <div className="flex-shrink-0 w-16 h-16 bg-dark-green rounded-lg flex flex-col items-center justify-center">
                  <i className={`${event.icon} text-lime text-2xl`}></i>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 ${event.color} text-dark-green text-xs font-bold rounded-full whitespace-nowrap`}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="text-dark-green font-semibold text-base group-hover:text-lime transition-colors leading-snug mb-1">
                    {event.title}
                  </h4>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-dark-green-tint-1 text-xs flex items-center gap-1">
                      <i className="ri-map-pin-line"></i> {event.location}
                    </span>
                    <span className="text-dark-green-tint-1 text-xs flex items-center gap-1 font-medium italic">
                      <i className="ri-time-line"></i> {event.time}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-dark-green/30 group-hover:text-lime transition-colors">
                  <i className="ri-arrow-right-line text-lg"></i>
                </div>
              </motion.div>
            ))}

            {/* Educational Forums Info Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-dark-green/5 border border-dark-green/20 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-lime/20 rounded-lg flex-shrink-0">
                  <i className="ri-book-open-line text-lime text-lg"></i>
                </div>
                <div>
                  <h4 className="text-dark-green font-semibold text-base mb-1">Community Educational Forums</h4>
                  <p className="text-dark-green-tint-1 text-sm leading-relaxed">
                    District 28 deserves informed voters and engaged citizens. Mel is committed to hosting community educational forums — bringing residents together to understand their rights, local policy, and how government decisions affect their daily lives. These forums are a core part of the campaign trail. Stay tuned for announcements.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="pt-2"
            >
              <a
                href="#"
                className="inline-flex items-center gap-2 text-dark-green font-semibold text-sm hover:text-lime transition-colors cursor-pointer whitespace-nowrap"
              >
                View full campaign schedule <i className="ri-arrow-right-line"></i>
              </a>
            </motion.div>
          </motion.div>

          {/* Volunteer Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={!isMobile && isInView ? { opacity: 1, x: 0 } : {}}
            style={isMobile ? { scale: mobileScale3, opacity: mobileOpacity3 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-dark-green rounded-2xl p-8 lg:p-10"
          >
            <h3 className="text-3xl font-display text-white mb-2">Join the Movement</h3>
            <p className="text-white/70 text-sm mb-8">
              Ready to make a difference in District 28? Sign up and our team will reach out with opportunities in your area.
            </p>

            {formState === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-lime rounded-full mb-4">
                  <i className="ri-check-line text-3xl text-dark-green"></i>
                </div>
                <h4 className="text-white text-2xl font-display mb-2">You&apos;re In!</h4>
                <p className="text-white/70 text-sm max-w-xs">
                  Thank you for signing up to volunteer. Our campaign team will be in touch soon!
                </p>
              </motion.div>
            ) : (
              <form
                data-readdy-form
                id="volunteer-signup-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Full Name <span className="text-lime">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Smith"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-lime transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Email <span className="text-lime">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@email.com"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-lime transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(678) 555-0100"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-lime transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    How Would You Like to Help?
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-lime transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-dark-green">Select an option</option>
                    <option value="Canvassing" className="bg-dark-green">Door-to-Door Canvassing</option>
                    <option value="Phone Banking" className="bg-dark-green">Phone Banking</option>
                    <option value="Events" className="bg-dark-green">Event Organizing</option>
                    <option value="Social Media" className="bg-dark-green">Social Media &amp; Digital</option>
                    <option value="Fundraising" className="bg-dark-green">Fundraising</option>
                    <option value="Other" className="bg-dark-green">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={500}
                    rows={3}
                    placeholder="Tell us a bit about yourself or your availability..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-lime transition-colors resize-none"
                  />
                  <p className="text-white/40 text-xs mt-1 text-right">{formData.message.length}/500</p>
                </div>

                {formState === 'error' && (
                  <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full py-4 bg-lime text-dark-green font-bold text-sm rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formState === 'submitting' ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="ri-hand-heart-line"></i> Join the Movement
                    </>
                  )}
                </button>

                <p className="text-white/40 text-xs text-center">
                  Paid for by Mel Keyton for Senate. Your information will never be sold or shared.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
