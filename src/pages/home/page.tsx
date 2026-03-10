import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ImpactStatement from './components/ImpactStatement';
import PhotoGallery from './components/PhotoGallery';
import OnOffTrack from './components/OnOffTrack';
import HelmetGallery from './components/HelmetGallery';
import StoreSection from './components/StoreSection';
import CampaignEvents from './components/CampaignEvents';
import PartnersSection from './components/PartnersSection';
import SocialSection from './components/SocialSection';
import Footer from './components/Footer';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-green">
      <Navigation scrolled={scrolled} />
      <main>
        <HeroSection />
        <ImpactStatement />
        <PhotoGallery />
        <OnOffTrack />
        <HelmetGallery />
        <StoreSection />
        <CampaignEvents />
        <PartnersSection />
        <SocialSection />
      </main>
      <Footer />
    </div>
  );
}