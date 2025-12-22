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

  // Barra de progresso "enganosa" - curva ULTRA agressiva
  // No ponto de unlock (50% real), a barra já está em ~93% visual
  const calculateDisplayProgress = useCallback((real: number): number => {
    let display: number;
    
    if (real <= 0.05) {
      // 0-5% real = 0-40% visual (8x mais rápido!)
      display = real * 8;
    } else if (real <= 0.15) {
      // 5-15% real = 40-70% visual (3x mais rápido)
      display = 0.40 + ((real - 0.05) / 0.10) * 0.30;
    } else if (real <= 0.50) {
      // 15-50% real = 70-93% visual (desacelerando)
      display = 0.70 + ((real - 0.15) / 0.35) * 0.23;
    } else {
      // 50-100% real = 93-100% visual (bem lento, "quase acabando")
      display = 0.93 + ((real - 0.50) / 0.50) * 0.07;
    }
    
    // Clamp entre 0 e 1
    return Math.min(1, Math.max(0, display));
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
