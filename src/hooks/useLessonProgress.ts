import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseLessonProgressOptions {
  lessonId: string;
  videoDuration?: number;
  completionThreshold?: number; // Percentage (0-1) to mark as complete
}

export function useLessonProgress({
  lessonId,
  videoDuration = 0,
  completionThreshold = 0.9,
}: UseLessonProgressOptions) {
  const { user } = useAuth();
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastSaveRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load existing progress
  useEffect(() => {
    async function loadProgress() {
      if (!user?.id || !lessonId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("lesson_progress")
        .select("watched_seconds, is_completed")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      if (!error && data) {
        setWatchedSeconds(data.watched_seconds || 0);
        setIsCompleted(data.is_completed || false);
      }
      setIsLoading(false);
    }

    loadProgress();
  }, [user?.id, lessonId]);

  // Check for certificate after completing a lesson
  const checkCertificate = useCallback(async () => {
    if (!user?.id || !lessonId) return;

    try {
      const { data, error } = await supabase.functions.invoke("check-certificate", {
        body: { userId: user.id, lessonId },
      });

      if (error) {
        console.error("Error checking certificate:", error);
        return;
      }

      if (data?.issued) {
        toast.success("🎓 Parabéns! Você concluiu o curso e recebeu seu certificado!", {
          duration: 8000,
          description: `Código: ${data.code}`,
        });
      }
    } catch (err) {
      console.error("Error invoking check-certificate:", err);
    }
  }, [user?.id, lessonId]);

  // Save progress to database
  const saveProgress = useCallback(async (seconds: number, completed: boolean, shouldCheckCertificate = false) => {
    if (!user?.id || !lessonId) return;

    const { error } = await supabase
      .from("lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        watched_seconds: Math.floor(seconds),
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,lesson_id",
      });

    if (error) {
      console.error("Error saving progress:", error);
    }

    // Check for certificate after saving completion
    if (shouldCheckCertificate && completed) {
      await checkCertificate();
    }
  }, [user?.id, lessonId, checkCertificate]);

  // Update progress (debounced save every 10 seconds)
  const updateProgress = useCallback((currentTime: number, duration: number) => {
    if (!user?.id) return;

    setWatchedSeconds(currentTime);

    // Check if completed
    const progressPercent = duration > 0 ? currentTime / duration : 0;
    const shouldComplete = progressPercent >= completionThreshold && !isCompleted;

    if (shouldComplete) {
      setIsCompleted(true);
      saveProgress(currentTime, true, true); // Check certificate on completion
      return;
    }

    // Debounce save - save every 10 seconds
    const now = Date.now();
    if (now - lastSaveRef.current >= 10000) {
      lastSaveRef.current = now;
      saveProgress(currentTime, isCompleted, false);
    } else {
      // Schedule save for later
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress(currentTime, isCompleted, false);
        lastSaveRef.current = Date.now();
      }, 10000);
    }
  }, [user?.id, isCompleted, completionThreshold, saveProgress]);

  // Mark as complete manually
  const markComplete = useCallback(async () => {
    if (!user?.id || isCompleted) return;
    
    setIsCompleted(true);
    await saveProgress(watchedSeconds, true, true); // Check certificate on manual completion
  }, [user?.id, isCompleted, watchedSeconds, saveProgress]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    watchedSeconds,
    isCompleted,
    isLoading,
    updateProgress,
    markComplete,
    initialTime: watchedSeconds, // For video seek
  };
}
