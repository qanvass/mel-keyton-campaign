import { useState } from 'react';
import DonateModal from './DonateModal';

const Footer = () => {
  const [showDonate, setShowDonate] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1a472a] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Mel Keyton</h3>
            <p className="text-white/80 leading-relaxed">
              Fighting for District 28 families across Southern Cobb, Eastern Douglas, and South Fulton — a <strong>Tri-County District</strong> united by one voice. Protecting wealth, building stronger communities, and bringing real change to the Georgia State Senate.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('campaign-trail')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Campaign Trail
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('community')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  In The Community
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('priorities')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Policy Priorities
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Get Involved</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@melkeyton.com"
                  className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
                >
                  Contact Campaign
                </a>
              </li>
              <li>
                <a
                  href="#campaign-events"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('campaign-events')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-white/80 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  Volunteer
                </a>
              </li>
              <li>
                <button
                  onClick={() => setShowDonate(true)}
                  className="px-8 py-3.5 bg-lime text-dark-green text-sm font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap"
                >
                  Contribute Now
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © 2025 Mel Keyton for Senate District 28 — Tri-County District. All rights reserved.
              <br />
              <span className="text-white/40 text-xs">Independent Democrat · Mel's thoughts belong to the people of D28.</span>
            </p>
            <a href="/admin/login" className="text-xs text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest mt-2 block w-fit">Staff Login</a>
            <div className="flex gap-6">
              <a
                href="https://twitter.com/melkeyton"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a
                href="https://facebook.com/melkeyton"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a
                href="https://instagram.com/melkeyton"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <i className="ri-instagram-line text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
    </footer>
  );
};

export default Footer;