import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVideoProgressOptions {
  onUnlock?: () => void;
  unlockThreshold?: number;
}

export function useVideoProgress({ onUnlock, unlockThreshold = 0.5 }: UseVideoProgressOptions = {}) {
  const [realProgress, setRealProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const hasTriggeredUnlock = useRef(false);

  // Barra de progresso "enganosa" - começa MUITO rápido e desacelera
  const calculateDisplayProgress = useCallback((real: number): number => {
    if (real <= 0.05) {
      // Primeiros 5% reais = 25% visual (5x mais rápido!)
      return real * 5;
    } else if (real <= 0.15) {
      // 5-15% real = 25-50% visual (ainda 2.5x mais rápido)
      return 0.25 + ((real - 0.05) / 0.10) * 0.25;
    } else {
      // 15-100% real = 50-100% visual (muito mais lento)
      return 0.50 + ((real - 0.15) / 0.85) * 0.50;
    }
  }, []);

  const displayProgress = calculateDisplayProgress(realProgress);

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    if (duration > 0) {
      const progress = currentTime / duration;
      setRealProgress(progress);
    }
  }, []);

  // Trigger unlock at threshold
  useEffect(() => {
    if (realProgress >= unlockThreshold && !hasTriggeredUnlock.current) {
      hasTriggeredUnlock.current = true;
      setHasUnlocked(true);
      onUnlock?.();
    }
  }, [realProgress, unlockThreshold, onUnlock]);

  // Check localStorage for previously unlocked state
  useEffect(() => {
    const saved = localStorage.getItem('vsl_unlocked');
    if (saved === 'true') {
      setHasUnlocked(true);
      hasTriggeredUnlock.current = true;
    }
  }, []);

  // Save unlock state
  useEffect(() => {
    if (hasUnlocked) {
      localStorage.setItem('vsl_unlocked', 'true');
    }
  }, [hasUnlocked]);

  return {
    realProgress,
    displayProgress,
    isPlaying,
    setIsPlaying,
    updateProgress,
    hasUnlocked,
  };
}
