import { useRef, useCallback } from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { useVideoProgress } from '@/hooks/useVideoProgress';

export default function Index() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleUnlock = useCallback(() => {
    // Smooth scroll to content when unlocked
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }, []);

  const {
    displayProgress,
    isPlaying,
    setIsPlaying,
    updateProgress,
    hasUnlocked,
  } = useVideoProgress({ onUnlock: handleUnlock, unlockThreshold: 0.5 });

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero with VSL - Always visible */}
      <HeroSection
        displayProgress={displayProgress}
        isPlaying={isPlaying}
        hasUnlocked={hasUnlocked}
        onPlayPause={setIsPlaying}
        onTimeUpdate={updateProgress}
        onScrollToContent={scrollToContent}
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
        <BenefitsSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
