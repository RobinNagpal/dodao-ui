'use client';
import { useState, useEffect } from 'react';
import {
  HeroSection,
  HowItWorksSection,
  SubjectsSection,
  BenefitsSection,
  FeaturesSection,
  DemoSection,
  FAQSection,
  CTASection,
} from '@/components/genai-simulation';
import VideoModal from './VideoModal';

export default function SimulationPageWrapper() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    // Show video modal when page loads
    const timer = setTimeout(() => {
      setIsVideoModalOpen(true);
    }, 500); // Small delay to let the page load smoothly

    return () => clearTimeout(timer);
  }, []);

  const handleOpenVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <>
      <main className="bg-gray-900 overflow-hidden">
        <HeroSection onOpenVideo={handleOpenVideoModal} />
        <SubjectsSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FeaturesSection />
        <DemoSection />
        <FAQSection />
        <CTASection />
      </main>
      
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={handleCloseVideoModal} 
      />
    </>
  );
}
