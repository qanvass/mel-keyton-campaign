import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { API_BASE_URL } from '@/config';
import DonateModal from './DonateModal';

const TSHIRT_SLIDES = [
  'https://readdy.ai/api/search-image?query=young%20Black%20man%20wearing%20white%20Vote%20Mel%20Keyton%20District%2028%20campaign%20t-shirt%20smiling%20outdoors%20Georgia%20neighborhood%20sunny%20day%20casual%20confident%20pose%20clean%20simple%20background&width=400&height=400&seq=tshirt_model1&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Black%20woman%20wearing%20white%20Vote%20Mel%20Keyton%20District%2028%20campaign%20t-shirt%20standing%20in%20front%20of%20Georgia%20community%20center%20smiling%20proud%20supporter%20natural%20light%20warm%20tones&width=400&height=400&seq=tshirt_model2&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Hispanic%20man%20wearing%20white%20Vote%20Mel%20Keyton%20District%2028%20campaign%20t-shirt%20outdoors%20Georgia%20park%20smiling%20casual%20confident%20community%20supporter%20sunny%20day&width=400&height=400&seq=tshirt_model3&orientation=squarish',
  'https://readdy.ai/api/search-image?query=older%20Black%20man%20wearing%20white%20Vote%20Mel%20Keyton%20District%2028%20campaign%20t-shirt%20standing%20on%20front%20porch%20Georgia%20home%20proud%20voter%20warm%20afternoon%20light&width=400&height=400&seq=tshirt_model4&orientation=squarish',
  'https://readdy.ai/api/search-image?query=white%20woman%20wearing%20white%20Vote%20Mel%20Keyton%20District%2028%20campaign%20t-shirt%20at%20outdoor%20Georgia%20community%20event%20smiling%20engaged%20supporter%20natural%20daylight&width=400&height=400&seq=tshirt_model5&orientation=squarish',
];

function TShirtSlideshow() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % TSHIRT_SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + TSHIRT_SLIDES.length) % TSHIRT_SLIDES.length), []);

  useEffect(() => {
    const timer = setInterval(next, 2500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-48 overflow-hidden bg-gray-50 group/slide">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={TSHIRT_SLIDES[current]}
          alt={`Campaign T-Shirt model ${current + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/slide:opacity-100 transition-opacity cursor-pointer z-10"
      >
        <i className="ri-arrow-left-s-line text-sm" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/slide:opacity-100 transition-opacity cursor-pointer z-10"
      >
        <i className="ri-arrow-right-s-line text-sm" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
        {TSHIRT_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === current ? 'bg-lime w-3' : 'bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
}

const SWAG_ITEMS = [
  {
    id: 1,
    name: 'Campaign T-Shirt',
    price: '$25',
    description: 'Soft cotton tee — "Engineer Solutions. Vote Mel Keyton D28"',
    img: TSHIRT_SLIDES[0],
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    slideshow: true,
  },
  {
    id: 2,
    name: 'Snapback Hat',
    price: '$30',
    description: 'Structured snapback — green & white "MK D28" embroidered logo',
    img: 'https://readdy.ai/api/search-image?query=dark%20green%20snapback%20baseball%20cap%20with%20embroidered%20MK%20D28%20logo%20clean%20white%20background%20product%20photography%20professional%20campaign%20merchandise%20minimal%20style&width=400&height=400&seq=swag_hat1&orientation=squarish',
    options: ['One Size'],
    slideshow: false,
  },
  {
    id: 3,
    name: 'Yard Sign',
    price: '$15',
    description: 'Bold 18"×24" corrugated sign — perfect for your lawn or window',
    img: 'https://readdy.ai/api/search-image?query=bold%20political%20yard%20sign%20Vote%20Mel%20Keyton%20Georgia%20Senate%20District%2028%20green%20white%20colors%20corrugated%20plastic%20sign%20on%20white%20background%20clean%20product%20photography%20professional%20campaign%20signage&width=400&height=400&seq=swag_sign1&orientation=squarish',
    options: ['Single', '3-Pack', '5-Pack'],
    slideshow: false,
  },
  {
    id: 4,
    name: 'Bumper Sticker',
    price: '$5',
    description: 'Weather-resistant vinyl — "Mel Keyton · GA Senate D28"',
    img: 'https://readdy.ai/api/search-image?query=political%20bumper%20sticker%20Mel%20Keyton%20Georgia%20Senate%20District%2028%20green%20white%20bold%20typography%20vinyl%20sticker%20flat%20lay%20on%20white%20background%20clean%20product%20photography&width=400&height=400&seq=swag_sticker1&orientation=squarish',
    options: ['Single', '5-Pack'],
    slideshow: false,
  },
];

export default function StoreSection() {
  const { ref: inViewRef, isInView } = useInView({ threshold: 0.3 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShop, setShowShop] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof SWAG_ITEMS[0] | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const mobileY2 = useTransform(scrollYProgress, [0.4, 0.8], [150, 0]);
  const mobileOpacity2 = useTransform(scrollYProgress, [0.3, 0.6, 0.8], [0, 0.5, 1]);

  const openItem = (item: typeof SWAG_ITEMS[0]) => {
    setSelectedItem(item);
    setSelectedOption(item.options[0]);
    setSubmitted(false);
  };

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const orderData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      item: selectedItem?.name ?? '',
      option: selectedOption,
      address: (form.elements.namedItem('address') as HTMLInputElement).value,
    };
    try {
      await fetch(`${API_BASE_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <>
      <section ref={containerRef} className="py-32 bg-white relative overflow-hidden">
        <div ref={inViewRef as React.RefObject<HTMLDivElement>} className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={!isMobile && isInView ? { opacity: 1, x: 0 } : {}}
              style={isMobile ? { y: mobileY1, opacity: mobileOpacity1 } : {}}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <span className="inline-block px-4 py-2 bg-lime/10 border border-lime text-lime text-sm font-medium rounded-full mb-6 uppercase tracking-wider">
                  Support the Campaign
                </span>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-display text-dark-green leading-tight mb-6">
                  Vote
                  <br />
                  <span className="text-lime">Mel Keyton</span>
                </h2>
                <p className="text-lg text-dark-green-tint-1 mb-8">
                  Join the movement to bring real change to Georgia State Senate District 28 — South Fulton, Douglas, and South Cobb. Your support helps us protect family wealth, fight for working families, and build a stronger Georgia for all.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowDonate(true)}
                  className="inline-block px-8 py-3.5 bg-lime text-dark-green text-sm font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap"
                >
                  Join the Movement
                </button>
                <button
                  onClick={() => setShowShop(true)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-dark-green text-lime text-sm font-bold rounded-full hover:bg-dark-green/90 transition-all cursor-pointer whitespace-nowrap border-2 border-lime"
                >
                  <i className="ri-store-2-line" />
                  Get Your Swag
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={!isMobile && isInView ? { opacity: 1, x: 0 } : {}}
              style={isMobile ? { y: mobileY2, opacity: mobileOpacity2 } : {}}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <img
                  src="https://readdy.ai/api/search-image?query=Large%20bold%20Vote%20Mel%20Keyton%20campaign%20yard%20sign%20prominently%20displayed%20on%20green%20Georgia%20lawn%20bright%20sunny%20day%20patriotic%20red%20white%20and%20green%20colors%20bold%20typography%20clear%20readable%20text%20professional%20political%20signage%20shallow%20depth%20of%20field%20blurred%20neighborhood%20background%20high%20quality%20campaign%20photography&width=400&height=500&seq=storeVMK1&orientation=portrait"
                  alt="Vote Mel Keyton yard sign"
                  className="w-full h-auto rounded-lg"
                />
                <img
                  src="https://readdy.ai/api/search-image?query=African%20American%20community%20volunteers%20holding%20large%20Vote%20Mel%20Keyton%20campaign%20signs%20and%20banners%20at%20outdoor%20Georgia%20neighborhood%20event%20smiling%20enthusiastic%20supporters%20diverse%20group%20men%20and%20women%20bold%20sign%20text%20clearly%20visible%20warm%20sunlight%20authentic%20grassroots%20energy%20shallow%20depth%20of%20field&width=400&height=500&seq=storeVMK2&orientation=portrait"
                  alt="Vote Mel Keyton volunteers"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://readdy.ai/api/search-image?query=Vote%20Mel%20Keyton%20campaign%20rally%20banner%20stretched%20across%20outdoor%20stage%20in%20Georgia%20bold%20large%20text%20clearly%20readable%20patriotic%20colors%20red%20white%20green%20diverse%20African%20American%20crowd%20gathered%20below%20cheering%20sunny%20day%20professional%20political%20event%20photography%20shallow%20depth%20of%20field&width=400&height=500&seq=storeVMK3&orientation=portrait"
                  alt="Vote Mel Keyton rally banner"
                  className="w-full h-auto rounded-lg"
                />
                <img
                  src="https://public.readdy.ai/ai/img_res/edited_1b2ddaa0e12f5e8a615e2e91e1bc3206_f9e0c94e.jpg"
                  alt="Vote Mel Keyton merchandise"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Swag Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowShop(false); setSelectedItem(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-dark-green text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  {selectedItem && (
                    <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                      <i className="ri-arrow-left-line text-lg" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-lg font-bold font-display">
                      {selectedItem ? selectedItem.name : 'Mel Keyton Campaign Swag'}
                    </h3>
                    <p className="text-lime text-xs font-medium">
                      {selectedItem ? `${selectedItem.price} · Show your D28 pride` : 'Show your District 28 pride'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowShop(false); setSelectedItem(null); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              <div className="p-6">
                {!selectedItem ? (
                  <>
                    <p className="text-dark-green-tint-1 text-sm mb-6 text-center">
                      Every purchase helps fund the movement. Wear it, display it, share it — let D28 know Mel Keyton is on the ballot.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {SWAG_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openItem(item)}
                          className="group text-left bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-lime transition-all cursor-pointer"
                        >
                          {item.slideshow ? (
                            <TShirtSlideshow />
                          ) : (
                            <div className="w-full h-48 overflow-hidden bg-gray-50">
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-dark-green text-sm">{item.name}</span>
                              <span className="text-lime font-bold text-sm">{item.price}</span>
                            </div>
                            <p className="text-xs text-dark-green-tint-1 leading-relaxed">{item.description}</p>
                            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-lime">
                              Order Now <i className="ri-arrow-right-line" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-6">
                      Orders are fulfilled by the campaign. Questions? Email <span className="text-lime">info@melkeyton.com</span>
                    </p>
                  </>
                ) : submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 flex items-center justify-center bg-lime/10 rounded-full mx-auto mb-4">
                      <i className="ri-check-line text-3xl text-lime" />
                    </div>
                    <h4 className="text-2xl font-bold text-dark-green font-display mb-2">Order Received!</h4>
                    <p className="text-dark-green-tint-1 text-sm mb-6">
                      Thank you for supporting the movement. The campaign team will follow up with your order details shortly.
                    </p>
                    <button
                      onClick={() => { setSelectedItem(null); setSubmitted(false); }}
                      className="px-6 py-2.5 bg-lime text-dark-green text-sm font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Shop More Swag
                    </button>
                  </div>
                ) : (
                  <form data-readdy-form onSubmit={handleOrder} className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                        <img src={selectedItem.img} alt={selectedItem.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-dark-green text-sm">{selectedItem.name}</p>
                        <p className="text-lime font-bold text-sm">{selectedItem.price}</p>
                        <p className="text-xs text-dark-green-tint-1">{selectedItem.description}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-green mb-1 uppercase tracking-wide">
                        {selectedItem.options.length > 1 ? 'Select Option' : 'Size / Quantity'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedOption(opt)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${selectedOption === opt
                              ? 'bg-lime text-dark-green border-lime'
                              : 'bg-white text-dark-green border-gray-200 hover:border-lime'
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-green mb-1 uppercase tracking-wide">Full Name *</label>
                        <input
                          name="name"
                          required
                          placeholder="Your full name"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lime"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-green mb-1 uppercase tracking-wide">Email *</label>
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lime"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-green mb-1 uppercase tracking-wide">Phone</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="(404) 000-0000"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lime"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-green mb-1 uppercase tracking-wide">Shipping Address *</label>
                      <input
                        name="address"
                        required
                        placeholder="Street, City, State, ZIP"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lime"
                      />
                    </div>

                    <p className="text-xs text-gray-400">
                      The campaign team will contact you to confirm your order and arrange payment. No payment info is collected here.
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-lime text-dark-green text-sm font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
                    >
                      {submitting ? 'Submitting...' : `Request My ${selectedItem.name}`}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
    </>
  );
}
