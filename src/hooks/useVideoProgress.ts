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

  // Barra de progresso "enganosa" - começa rápido e desacelera
  const calculateDisplayProgress = useCallback((real: number): number => {
    if (real <= 0.2) {
      // Primeiros 20% reais = 40% visual (2x mais rápido)
      return real * 2;
    } else {
      // Restante: desacelera gradualmente
      // 20-100% real = 40-100% visual
      return 0.4 + ((real - 0.2) / 0.8) * 0.6;
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
