import { useRef, useState } from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { ObjectionsSection } from '@/components/landing/ObjectionsSection';
import { InstructorSection } from '@/components/landing/InstructorSection';
import { CTASection } from '@/components/landing/CTASection';
import { MiniCTASection } from '@/components/landing/MiniCTASection';
import { JourneySection } from '@/components/landing/JourneySection';
import { LeadCaptureModal } from '@/components/landing/LeadCaptureModal';
import { Footer } from '@/components/landing/Footer';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useCMSContent } from '@/hooks/useCMSContent';

export default function Index() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch all CMS content for landing page
  const { data: cmsContent } = useCMSContent('landing');

  const {
    displayProgress,
    isPlaying,
    setIsPlaying,
    updateProgress,
    hasUnlocked,
  } = useVideoProgress({ unlockThreshold: 0.5 });

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTAClick = () => {
    console.log('CTA clicked - opening modal, current state:', isModalOpen);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero with VSL - Always visible */}
      <HeroSection
        content={cmsContent}
        displayProgress={displayProgress}
        isPlaying={isPlaying}
        hasUnlocked={hasUnlocked}
        onPlayPause={setIsPlaying}
        onTimeUpdate={updateProgress}
        onScrollToContent={scrollToContent}
        onCTAClick={handleCTAClick}
      />

      {/* Locked Content - Only visible after 50% video */}
      <div
        ref={contentRef}
        className={`transition-all duration-700 ${
          hasUnlocked 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10 pointer-events-none h-0 overflow-hidden'
        }`}
      >
        <BenefitsSection content={cmsContent} />
        <CTASection content={cmsContent} onCTAClick={handleCTAClick} />
        <ObjectionsSection content={cmsContent} />
        <MiniCTASection content={cmsContent} onCTAClick={handleCTAClick} />
        <InstructorSection content={cmsContent} />
        <CTASection content={cmsContent} onCTAClick={handleCTAClick} />
        <JourneySection content={cmsContent} />
        <CTASection content={cmsContent} onCTAClick={handleCTAClick} />
        <Footer />
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}
