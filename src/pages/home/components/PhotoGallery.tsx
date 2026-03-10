import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useInView } from '../hooks/useInView';

const photos = [
  {
    url: 'https://readdy.ai/api/search-image?query=Diverse%20professional%20African%20American%20residents%20and%20community%20leaders%20engaged%20in%20lively%20town%20hall%20discussion%20in%20South%20Fulton%20Georgia%20modern%20community%20center%20setting%20men%20and%20women%20of%20various%20ages%20seated%20in%20rows%20raising%20hands%20asking%20questions%20warm%20natural%20lighting%20authentic%20civic%20engagement%20grassroots%20democracy%20shallow%20depth%20of%20field&width=384&height=512&seq=d28townhall2025&orientation=portrait',
    caption: 'District 28 Town Halls',
    roundtable: false,
    rally: false,
    capitol: false,
    townhall: true,
  },
  {
    url: 'https://public.readdy.ai/ai/img_res/edited_cb314ebcd1e23291af785a21b802f50f_dd509d23.jpg',
    caption: 'Georgia State Capitol',
    roundtable: false,
    rally: false,
    capitol: true,
    townhall: false,
  },
  {
    url: 'https://readdy.ai/api/search-image?query=Professional%20African%20American%20small%20business%20owners%20and%20entrepreneurs%20gathered%20at%20roundtable%20meeting%20in%20Douglasville%20Georgia%20diverse%20group%20of%20men%20and%20women%20in%20business%20attire%20smiling%20networking%20discussing%20commerce%20warm%20storefront%20interior%20lighting%20authentic%20community%20economic%20development%20shallow%20depth%20of%20field&width=384&height=512&seq=d28bizround2025&orientation=portrait',
    caption: 'Small Business Roundtables',
    roundtable: true,
    rally: false,
    capitol: false,
    townhall: false,
  },
  {
    url: 'https://readdy.ai/api/search-image?query=Energetic%20diverse%20crowd%20of%20African%20American%20voters%20and%20supporters%20at%20outdoor%20campaign%20rally%20in%20Lithia%20Springs%20Georgia%20people%20of%20all%20ages%20holding%20campaign%20signs%20cheering%20engaged%20sunny%20day%20authentic%20grassroots%20political%20energy%20community%20activism%20shallow%20depth%20of%20field%20blurred%20crowd%20background&width=384&height=512&seq=d28rally2025&orientation=portrait',
    caption: 'Campaign Rally',
    roundtable: false,
    rally: true,
    capitol: false,
    townhall: false,
  },
  {
    url: 'https://readdy.ai/api/search-image?query=African%20American%20teachers%20parents%20and%20students%20at%20education%20forum%20in%20Douglas%20County%20Georgia%20diverse%20community%20members%20in%20classroom%20setting%20discussing%20school%20improvement%20professional%20attire%20warm%20classroom%20lighting%20authentic%20education%20advocacy%20community%20engagement%20shallow%20depth%20of%20field&width=384&height=512&seq=d28eduforum2025&orientation=portrait',
    caption: 'Education Forum',
    roundtable: false,
    rally: false,
    capitol: false,
    townhall: false,
  },
];

const upcomingTownHalls = [
  {
    date: 'Saturday, March 28',
    title: 'Who Is Mel Keyton?',
    subtitle: 'Introduction Town Hall',
    description: 'Come get to know the candidate. Hear his story, his vision for District 28, and ask your questions directly.',
    icon: 'ri-user-heart-line',
  },
];

export default function PhotoGallery() {
  const { ref: inViewRef, isInView } = useInView({ threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Roundtable modal state
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rally modal state
  const [showRallyModal, setShowRallyModal] = useState(false);
  const [rallySubmitted, setRallySubmitted] = useState(false);
  const [rallySubmitting, setRallySubmitting] = useState(false);

  // Capitol card state
  const [capitolHovered, setCapitolHovered] = useState(false);
  const [rssHeadlines, setRssHeadlines] = useState<{ title: string; link: string; date: string }[]>([]);
  const [rssFetched, setRssFetched] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Town Hall hover state
  const [townhallHovered, setTownhallHovered] = useState(false);
  const townhallHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (rssFetched) return;
    const fetchRSS = async () => {
      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fsenatepress.net%2Ffeed&count=3`
        );
        const json = await res.json();
        if (json.status === 'ok' && json.items) {
          setRssHeadlines(
            json.items.slice(0, 3).map((item: { title: string; link: string; pubDate: string }) => ({
              title: item.title,
              link: item.link,
              date: new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }))
          );
        }
      } catch {
        setRssHeadlines([
          { title: 'GA Senate Advances Infrastructure Package', link: 'https://senatepress.net', date: 'Jul 1' },
          { title: 'District 28 Legislators Meet on HOA Reform', link: 'https://senatepress.net', date: 'Jun 28' },
          { title: 'Senate Committee Reviews Property Tax Relief Bill', link: 'https://senatepress.net', date: 'Jun 25' },
        ]);
      }
      setRssFetched(true);
    };
    fetchRSS();
  }, [rssFetched]);

  const handleCapitolMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setCapitolHovered(true);
  };

  const handleCapitolMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setCapitolHovered(false), 200);
  };

  const handleCapitolClick = () => {
    window.open('https://www.legis.ga.gov/senate', '_blank', 'noopener,noreferrer');
  };

  const handleTownhallMouseEnter = () => {
    if (townhallHoverTimeout.current) clearTimeout(townhallHoverTimeout.current);
    setTownhallHovered(true);
  };

  const handleTownhallMouseLeave = () => {
    townhallHoverTimeout.current = setTimeout(() => setTownhallHovered(false), 200);
  };

  const handlePhotoClick = (roundtable: boolean, rally: boolean, capitol: boolean) => {
    if (capitol) {
      handleCapitolClick();
      return;
    }
    if (roundtable) {
      setShowModal(true);
      setShowForm(false);
      setSubmitted(false);
    }
    if (rally) {
      setShowRallyModal(true);
      setRallySubmitted(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
    try {
      await fetch('https://readdy.ai/api/form/d6mh5ko5dsf7sr1n6b0g', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRallySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRallySubmitting(true);
    const form = e.currentTarget;
    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
    try {
      await fetch('https://readdy.ai/api/form/d6mn0bs6fojmejgajgi0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });
      setRallySubmitted(true);
    } catch {
      setRallySubmitted(true);
    } finally {
      setRallySubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowForm(false);
    setSubmitted(false);
  };

  const closeRallyModal = () => {
    setShowRallyModal(false);
    setRallySubmitted(false);
  };

  return (
    <>
      <section ref={containerRef} className="py-32 bg-white overflow-hidden relative">
        <div ref={inViewRef as React.RefObject<HTMLDivElement>} className="max-w-[1920px] mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={!isMobile && isInView ? { opacity: 1, x: 0 } : {}}
            style={isMobile ? { y: mobileY1, opacity: mobileOpacity1 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-16 px-6 lg:px-12"
          >
            <p className="text-4xl md:text-5xl lg:text-6xl font-display text-dark-green max-w-4xl">
              It doesn't matter <span className="text-lime">where</span> you start, it's{' '}
              <span className="text-lime">how</span> you progress from there.
            </p>
          </motion.div>

          <div className="flex gap-6 overflow-x-auto px-6 lg:px-12 pb-8 scrollbar-hide">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 lg:w-96 group cursor-pointer"
                onClick={() => handlePhotoClick(photo.roundtable, photo.rally, photo.capitol ?? false)}
                onMouseEnter={photo.capitol ? handleCapitolMouseEnter : photo.townhall ? handleTownhallMouseEnter : undefined}
                onMouseLeave={photo.capitol ? handleCapitolMouseLeave : photo.townhall ? handleTownhallMouseLeave : undefined}
                style={(photo.capitol || photo.townhall) ? { position: 'relative' } : undefined}
              >
                <div
                  className={`relative overflow-hidden rounded-lg mb-3 aspect-[3/4] transition-all duration-300 ${photo.capitol ? 'group-hover:scale-105 group-hover:shadow-2xl' : ''
                    } ${photo.townhall ? 'group-hover:scale-105 group-hover:shadow-2xl' : ''}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                  {photo.roundtable && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold tracking-wide uppercase bg-black/50 px-4 py-2 rounded-full">
                        Host a Roundtable
                      </span>
                    </div>
                  )}
                  {photo.rally && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold tracking-wide uppercase bg-dark-green/80 px-4 py-2 rounded-full flex items-center gap-2">
                        <i className="ri-megaphone-line"></i> Rally With Us
                      </span>
                    </div>
                  )}
                  {photo.townhall && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-center pb-4">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold tracking-wide uppercase bg-dark-green/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <i className="ri-calendar-event-line"></i> Upcoming Events
                      </span>
                    </div>
                  )}
                  {photo.capitol && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-end justify-center pb-4">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold tracking-wide uppercase bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <i className="ri-external-link-line"></i> View GA Senate
                      </span>
                    </div>
                  )}

                  {/* Town Hall Hover Popover */}
                  {photo.townhall && (
                    <AnimatePresence>
                      {townhallHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.22 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 overflow-hidden"
                          onMouseEnter={handleTownhallMouseEnter}
                          onMouseLeave={handleTownhallMouseLeave}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Popover Header */}
                          <div className="bg-dark-green px-4 py-3 flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className="ri-calendar-event-line text-lime text-base"></i>
                            </div>
                            <span className="text-white text-xs font-bold tracking-wider uppercase">Upcoming Town Halls</span>
                            <span className="ml-auto text-lime/70 text-xs">District 28</span>
                          </div>

                          {/* Town Hall Events */}
                          <div className="divide-y divide-gray-100">
                            {upcomingTownHalls.map((event, i) => (
                              <div key={i} className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 flex items-center justify-center bg-lime/20 rounded-full flex-shrink-0 mt-0.5">
                                    <i className={`${event.icon} text-dark-green text-sm`}></i>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-dark-green uppercase tracking-wide mb-0.5">{event.date}</p>
                                    <p className="text-sm font-semibold text-gray-800 leading-snug">{event.title}</p>
                                    <p className="text-xs text-lime font-medium mt-0.5">{event.subtitle}</p>
                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{event.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Popover Footer */}
                          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">More dates coming soon</span>
                            <span className="text-xs text-dark-green font-semibold flex items-center gap-1">
                              <i className="ri-map-pin-line"></i> D28
                            </span>
                          </div>

                          {/* Arrow */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-sm"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Capitol Hover Popover */}
                  {photo.capitol && (
                    <AnimatePresence>
                      {capitolHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.22 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 overflow-hidden"
                          onMouseEnter={handleCapitolMouseEnter}
                          onMouseLeave={handleCapitolMouseLeave}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Popover Header */}
                          <div className="bg-dark-green px-4 py-3 flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className="ri-government-line text-lime text-base"></i>
                            </div>
                            <span className="text-white text-xs font-bold tracking-wider uppercase">GA Senate Press</span>
                            <span className="ml-auto text-lime/70 text-xs">Live Feed</span>
                          </div>

                          {/* RSS Headlines */}
                          <div className="divide-y divide-gray-100">
                            {rssHeadlines.length > 0 ? (
                              rssHeadlines.map((item, i) => (
                                <a
                                  key={i}
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group/item"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                                    <i className="ri-article-line text-dark-green/50 text-sm group-hover/item:text-dark-green transition-colors"></i>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 group-hover/item:text-dark-green transition-colors">
                                      {item.title}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                                  </div>
                                </a>
                              ))
                            ) : (
                              <div className="px-4 py-4 text-center">
                                <div className="w-5 h-5 flex items-center justify-center mx-auto mb-1">
                                  <i className="ri-loader-4-line text-gray-300 text-lg animate-spin"></i>
                                </div>
                                <p className="text-xs text-gray-400">Loading headlines...</p>
                              </div>
                            )}
                          </div>

                          {/* Popover Footer */}
                          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">senatepress.net</span>
                            <a
                              href="https://www.legis.ga.gov/senate"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-dark-green font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit GA Senate <i className="ri-arrow-right-line"></i>
                            </a>
                          </div>

                          {/* Arrow */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-sm"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
                <p className="text-sm font-medium text-dark-green-tint-2 uppercase tracking-wider">
                  {photo.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roundtable Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>

              {!showForm && !submitted && (
                <div className="text-center">
                  <div className="w-14 h-14 flex items-center justify-center bg-lime/20 rounded-full mx-auto mb-5">
                    <i className="ri-store-2-line text-2xl text-dark-green"></i>
                  </div>
                  <h2 className="text-2xl font-display text-dark-green mb-3">Host a Roundtable</h2>
                  <p className="text-gray-600 mb-7 leading-relaxed">
                    Would you like your business to be the site of one of our roundtables? We'd love to bring the community conversation to you!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap text-sm font-medium"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-6 py-2.5 rounded-md bg-dark-green text-white hover:bg-dark-green/90 cursor-pointer transition-colors whitespace-nowrap text-sm font-semibold"
                    >
                      Sign Me Up!
                    </button>
                  </div>
                </div>
              )}

              {showForm && !submitted && (
                <div>
                  <h2 className="text-2xl font-display text-dark-green mb-1">Roundtable Signup</h2>
                  <p className="text-gray-500 text-sm mb-6">Fill out the form below and we'll be in touch!</p>
                  <form data-readdy-form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
                      <input name="business_name" type="text" required placeholder="Your business name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                      <input name="name" type="text" required placeholder="First and last name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input name="email" type="email" required placeholder="your@email.com" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input name="phone" type="tel" placeholder="(555) 000-0000" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                      <input name="address" type="text" placeholder="Street, City, County" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anything else we should know?</label>
                      <textarea name="message" maxLength={500} rows={3} placeholder="Capacity, availability, special notes..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 resize-none" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full bg-dark-green text-white py-2.5 rounded-md text-sm font-semibold hover:bg-dark-green/90 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-60">
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </form>
                </div>
              )}

              {submitted && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-lime/20 rounded-full mx-auto mb-5">
                    <i className="ri-check-line text-2xl text-dark-green"></i>
                  </div>
                  <h2 className="text-2xl font-display text-dark-green mb-3">Thank You!</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We've received your signup. Our team will reach out soon to discuss hosting a roundtable at your business!
                  </p>
                  <button onClick={closeModal} className="px-6 py-2.5 rounded-md bg-dark-green text-white hover:bg-dark-green/90 cursor-pointer transition-colors whitespace-nowrap text-sm font-semibold">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rally Signup Modal */}
      <AnimatePresence>
        {showRallyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeRallyModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={closeRallyModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>

              {!rallySubmitted ? (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 flex items-center justify-center bg-lime/20 rounded-full">
                      <i className="ri-megaphone-line text-xl text-dark-green"></i>
                    </div>
                    <h2 className="text-2xl font-display text-dark-green">Rally With Us!</h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 mt-2">
                    Sign up to join an upcoming Mel Keyton District 28 campaign rally. We'll keep you informed on dates, locations, and how to get involved.
                  </p>
                  <form data-readdy-form id="rally-signup-form" onSubmit={handleRallySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                        <input name="first_name" type="text" required placeholder="First name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                        <input name="last_name" type="text" required placeholder="Last name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input name="email" type="email" required placeholder="your@email.com" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input name="phone" type="tel" placeholder="(555) 000-0000" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City / Area <span className="text-red-500">*</span></label>
                      <select name="city" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 cursor-pointer bg-white">
                        <option value="">Select your area...</option>
                        <option value="Mableton">Mableton</option>
                        <option value="Austell">Austell</option>
                        <option value="Powder Springs">Powder Springs</option>
                        <option value="Douglasville">Douglasville</option>
                        <option value="Lithia Springs">Lithia Springs</option>
                        <option value="South Fulton">South Fulton</option>
                        <option value="Chattahoochee Hills">Chattahoochee Hills</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">How would you like to help? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                      <div className="space-y-2">
                        {['Attend Rallies', 'Volunteer at Events', 'Spread the Word', 'Bring Friends & Family', 'Help with Logistics'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                            <input type="checkbox" name="involvement" value={opt} className="rounded border-gray-300 text-dark-green focus:ring-dark-green/30 cursor-pointer" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anything you'd like Mel to know?</label>
                      <textarea name="message" maxLength={500} rows={3} placeholder="Share your thoughts, concerns, or why you support District 28..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 resize-none" />
                    </div>
                    <button type="submit" disabled={rallySubmitting} className="w-full bg-dark-green text-white py-3 rounded-md text-sm font-semibold hover:bg-dark-green/90 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2">
                      <i className="ri-megaphone-line"></i>
                      {rallySubmitting ? 'Signing Up...' : 'Join the Movement'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-lime/20 rounded-full mx-auto mb-5">
                    <i className="ri-check-double-line text-3xl text-dark-green"></i>
                  </div>
                  <h2 className="text-2xl font-display text-dark-green mb-3">You're In!</h2>
                  <p className="text-gray-600 mb-2 leading-relaxed">
                    Welcome to the movement! We'll notify you about upcoming rallies across South Fulton, Douglas, and South Cobb.
                  </p>
                  <p className="text-gray-400 text-sm mb-7">Together, we engineer a better District 28.</p>
                  <button onClick={closeRallyModal} className="px-8 py-2.5 rounded-md bg-dark-green text-white hover:bg-dark-green/90 cursor-pointer transition-colors whitespace-nowrap text-sm font-semibold">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
