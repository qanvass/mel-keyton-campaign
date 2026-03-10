import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useRef, useState, useEffect } from 'react';

export default function OnOffTrack() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

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

  const mobileY1 = useTransform(scrollYProgress, [0, 0.4], [150, 0]);
  const mobileOpacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0.5, 1]);

  const mobileY2 = useTransform(scrollYProgress, [0.2, 0.6], [150, 0]);
  const mobileOpacity2 = useTransform(scrollYProgress, [0.1, 0.4, 0.6], [0, 0.5, 1]);

  const mobileY3 = useTransform(scrollYProgress, [0.4, 0.8], [150, 0]);
  const mobileOpacity3 = useTransform(scrollYProgress, [0.3, 0.6, 0.8], [0, 0.5, 1]);

  const mobileY4 = useTransform(scrollYProgress, [0.6, 1], [150, 0]);
  const mobileOpacity4 = useTransform(scrollYProgress, [0.5, 0.8, 1], [0, 0.5, 1]);

  const counties = [
    {
      name: 'Southern Cobb County',
      icon: 'ri-map-pin-2-line',
      cities: ['Mableton', 'Austell', 'Powder Springs'],
      color: 'from-lime/20 to-lime/5',
      border: 'border-lime',
    },
    {
      name: 'Eastern Douglas County',
      icon: 'ri-map-pin-2-line',
      cities: ['Douglasville', 'Lithia Springs'],
      color: 'from-emerald-100 to-emerald-50',
      border: 'border-emerald-500',
    },
    {
      name: 'South Fulton County',
      icon: 'ri-map-pin-2-line',
      cities: ['South Fulton', 'Chattahoochee Hills'],
      color: 'from-teal-100 to-teal-50',
      border: 'border-teal-500',
    },
  ];

  return (
    <section id="priorities" ref={containerRef} className="py-24 bg-white overflow-hidden relative">
      <div ref={ref as React.RefObject<HTMLDivElement>} className="max-w-7xl mx-auto px-6">

        {/* Bio / Storytelling Banner */}
        <motion.div
          style={isMobile ? { y: mobileY1, opacity: mobileOpacity1 } : {}}
          className={`mb-20 transition-all duration-1000 ${!isMobile && isInView ? 'opacity-100 translate-y-0' : (!isMobile ? 'opacity-0 translate-y-8' : '')
            }`}
        >
          <span className="inline-block px-4 py-2 bg-lime/10 border border-lime text-lime text-sm font-medium rounded-full mb-6 uppercase tracking-wider">
            About Mel
          </span>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-['Bebas_Neue'] text-5xl mb-6 tracking-wide text-dark-green">
                AN ENGINEER&apos;S MINDSET<br />
                <span className="text-lime">FOR GEORGIA&apos;S FUTURE.</span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                In 1986, Mel Keyton lived down the street from <strong>John Lewis</strong> — a man who believed in getting into <em>Good Trouble</em> for the right reasons. Seeing that legacy in person inspired Mel&apos;s path to servant leadership. That spirit never left him.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Mel knows District 28 because he <strong>grew up in it</strong>. His first job was at <strong>Cub Foods in Greenbriar</strong> — working alongside the same families he now seeks to serve. Having attended both <strong>Georgia Tech</strong> and <strong>Atlanta Technical College</strong> here in Atlanta, Mel learned that broken systems don&apos;t fix themselves — you have to diagnose the problem, design the solution, and build it right.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Now he&apos;s bringing that same <strong>Engineer&apos;s Mindset</strong> to the Georgia State Senate. District 28 — a <strong>Tri-County District</strong> spanning Southern Cobb, Eastern Douglas, and South Fulton — deserves a senator who treats every policy challenge like a systems problem: identify the root cause, protect the people, and deliver real results.
              </p>
              <p className="text-gray-600 leading-relaxed">
                A <strong>Christian family man</strong> and dedicated neighbor, Mel believes in servant leadership that puts people first. No shortcuts. No excuses. Just honest work for the community that raised him.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-xl shadow-xl h-80">
              <img
                src="https://static.readdy.ai/image/37f481326fda0879b2d66b8287a2bda5/0838de1bbe4297680c288a42efb10ed4.png"
                alt="Mel Keyton — Engineer, Leader, Servant"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-green/80 to-transparent p-6">
                <p className="text-white font-semibold text-sm">Mel Keyton — Engineer. Leader. Servant.</p>
                <p className="text-lime text-xs">Georgia State Senate, District 28 — Tri-County District</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Areas Served — Tri-County District Map */}
        <motion.div
          style={isMobile ? { y: mobileY2, opacity: mobileOpacity2 } : {}}
          className={`mb-20 transition-all duration-1000 delay-150 ${!isMobile && isInView ? 'opacity-100 translate-y-0' : (!isMobile ? 'opacity-0 translate-y-8' : '')
            }`}
        >
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-2 bg-lime/10 border border-lime text-lime text-sm font-medium rounded-full mb-4 uppercase tracking-wider">
              Areas Served
            </span>
            <h2 className="font-['Bebas_Neue'] text-5xl tracking-wide text-dark-green mb-3">
              DISTRICT 28 — TRI-COUNTY FOOTPRINT
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
              Following the <strong>2024 redistricting</strong>, Georgia Senate District 28 now spans three counties across western Metro Atlanta — bringing together communities in <strong>Southern Cobb, Eastern Douglas, and South Fulton</strong> under one unified voice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {counties.map((county) => (
              <div
                key={county.name}
                className={`rounded-xl border-2 ${county.border} bg-gradient-to-br ${county.color} p-6 shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <i className={`${county.icon} text-dark-green text-lg`}></i>
                  </div>
                  <h3 className="font-bold text-dark-green text-lg leading-tight">{county.name}</h3>
                </div>
                <ul className="space-y-2">
                  {county.cities.map((city) => (
                    <li key={city} className="flex items-center gap-2 text-gray-700 text-sm">
                      <i className="ri-checkbox-circle-fill text-lime text-base"></i>
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Map embed centered on the tri-county area */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100 h-72 w-full">
            <iframe
              title="Georgia Senate District 28 — Tri-County Area"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d131500!2d-84.6!3d33.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            ></iframe>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Map centered on the District 28 Tri-County region: Southern Cobb · Eastern Douglas · South Fulton
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - On The Trail */}
          <motion.div
            style={isMobile ? { y: mobileY3, opacity: mobileOpacity3 } : {}}
            className={`transition-all duration-1000 ${!isMobile && isInView ? 'opacity-100 translate-y-0' : (!isMobile ? 'opacity-0 translate-y-8' : '')
              }`}
          >
            <h2 className="font-['Bebas_Neue'] text-5xl mb-8 tracking-wide text-blue-900">
              ON THE TRAIL
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-[#14B8A6] pl-6">
                <h3 className="text-xl font-semibold mb-2">District 28 Town Hall Series</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hosting community conversations across all three counties — Southern Cobb, Eastern Douglas, and South Fulton — listening to residents in Mableton, Douglasville, Lithia Springs, Powder Springs, and Chattahoochee Hills about healthcare access, education funding, and economic opportunity.
                </p>
              </div>
              <div className="border-l-4 border-[#14B8A6] pl-6">
                <h3 className="text-xl font-semibold mb-2">Grassroots Organizing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Building a people-powered movement one conversation at a time. Mel has been knocking on doors across Mableton, Austell, Douglasville, Lithia Springs, and South Fulton — talking to working families, hearing their stories, and earning their trust the old-fashioned way.
                </p>
              </div>
              <div className="border-l-4 border-[#14B8A6] pl-6">
                <h3 className="text-xl font-semibold mb-2">Community Educational Forums</h3>
                <p className="text-gray-600 leading-relaxed">
                  An informed community is a powerful community. Mel is bringing educational forums to every corner of District 28 — from Powder Springs and Austell in Cobb County to Chattahoochee Hills in South Fulton — helping residents understand their rights, local policy, and how decisions made in Atlanta affect their everyday lives.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Policy Priorities */}
          <motion.div
            style={isMobile ? { y: mobileY4, opacity: mobileOpacity4 } : {}}
            className={`transition-all duration-1000 delay-300 ${!isMobile && isInView ? 'opacity-100 translate-y-0' : (!isMobile ? 'opacity-0 translate-y-8' : '')
              }`}
          >
            <h2 className="font-['Bebas_Neue'] text-5xl mb-8 tracking-wide text-red-600">
              POLICY PRIORITIES
            </h2>
            <div className="space-y-6">

              <div className="border-l-4 border-[#14B8A6] pl-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-home-heart-line text-lime text-lg"></i>
                  <h3 className="text-xl font-semibold">Ending the HOA Debt Trap</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  HOA boards are weaponizing fees and fines to foreclose on homeowners — stripping generational wealth from families across Mableton, Douglasville, and South Fulton. Mel will work to cap HOA fees, mandate transparency, and <strong>stop unfair foreclosures</strong> that rob families of their most valuable asset.
                </p>
              </div>

              <div className="border-l-4 border-[#14B8A6] pl-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-shield-star-line text-lime text-lg"></i>
                  <h3 className="text-xl font-semibold">The Legacy Homeowner Protection Act</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Seniors who built this community shouldn&apos;t be taxed out of their own homes. Mel will fight for property tax relief for long-term homeowners across all three counties — keeping elders in Lithia Springs, Powder Springs, and Chattahoochee Hills in their homes and preserving family wealth.
                </p>
              </div>

              <div className="border-l-4 border-[#14B8A6] pl-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-hand-coin-line text-lime text-lg"></i>
                  <h3 className="text-xl font-semibold">Standing Up to Greedy Insurance Hikes</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Insurance companies are gouging Georgia families with skyrocketing premiums while cutting coverage. Mel will hold insurers accountable, push for rate transparency, and fight for legislation that puts <strong>people over profits</strong> across Cobb, Douglas, and South Fulton counties.
                </p>
              </div>

              <div className="border-l-4 border-[#14B8A6] pl-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-store-2-line text-lime text-lg"></i>
                  <h3 className="text-xl font-semibold">Small Business Champion</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Mel will remove barriers to growth for local entrepreneurs in Mableton, Austell, Douglasville, and South Fulton — fighting for policies that support Main Street over Wall Street and creating real economic opportunity throughout the Tri-County District 28.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}