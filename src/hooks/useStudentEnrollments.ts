import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CourseWithProgress {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  enrolled_at: string;
  expires_at: string | null;
  status: string;
  totalLessons: number;
  completedLessons: number;
  totalWatchedSeconds: number;
  progressPercent: number;
}

interface StudentStats {
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalWatchedSeconds: number;
  progressPercent: number;
  certificatesCount: number;
}

export function useStudentEnrollments() {
  const { user } = useAuth();

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["student-enrollments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get enrollments with course data
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
          id,
          enrolled_at,
          expires_at,
          status,
          course_id,
          courses (
            id,
            title,
            description,
            slug,
            thumbnail_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (enrollmentError) throw enrollmentError;
      if (!enrollmentData?.length) return [];

      // Get all lessons for enrolled courses
      const courseIds = enrollmentData.map(e => e.course_id);
      
      const { data: modulesData } = await supabase
        .from("modules")
        .select("id, course_id")
        .in("course_id", courseIds)
        .eq("is_active", true);

      const moduleIds = modulesData?.map(m => m.id) || [];

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .eq("is_active", true);

      // Get user progress
      const lessonIds = lessonsData?.map(l => l.id) || [];
      
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed, watched_seconds")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      // Map lessons to courses
      const lessonToCourse: Record<string, string> = {};
      lessonsData?.forEach(lesson => {
        const module = modulesData?.find(m => m.id === lesson.module_id);
        if (module) {
          lessonToCourse[lesson.id] = module.course_id;
        }
      });

      // Calculate progress per course
      const coursesWithProgress: CourseWithProgress[] = enrollmentData.map(enrollment => {
        const course = enrollment.courses as any;
        const courseLessons = lessonsData?.filter(l => lessonToCourse[l.id] === course.id) || [];
        const courseProgress = progressData?.filter(p => lessonToCourse[p.lesson_id] === course.id) || [];
        
        const completedLessons = courseProgress.filter(p => p.is_completed).length;
        const totalWatchedSeconds = courseProgress.reduce((sum, p) => sum + (p.watched_seconds || 0), 0);
        const progressPercent = courseLessons.length > 0 
          ? Math.round((completedLessons / courseLessons.length) * 100)
          : 0;

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          slug: course.slug,
          thumbnail_url: course.thumbnail_url,
          enrolled_at: enrollment.enrolled_at,
          expires_at: enrollment.expires_at,
          status: enrollment.status,
          totalLessons: courseLessons.length,
          completedLessons,
          totalWatchedSeconds,
          progressPercent,
        };
      });

      return coursesWithProgress;
    },
    enabled: !!user?.id,
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery({
    queryKey: ["student-certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          certificate_code,
          issued_at,
          course_id,
          courses (
            title,
            slug
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats: StudentStats = {
    totalCourses: enrollments?.length || 0,
    totalLessons: enrollments?.reduce((sum, c) => sum + c.totalLessons, 0) || 0,
    completedLessons: enrollments?.reduce((sum, c) => sum + c.completedLessons, 0) || 0,
    totalWatchedSeconds: enrollments?.reduce((sum, c) => sum + c.totalWatchedSeconds, 0) || 0,
    progressPercent: enrollments?.length 
      ? Math.round(enrollments.reduce((sum, c) => sum + c.progressPercent, 0) / enrollments.length)
      : 0,
    certificatesCount: certificates?.length || 0,
  };

  // Get last lesson watched
  const { data: lastLesson } = useQuery({
    queryKey: ["student-last-lesson", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("lesson_progress")
        .select(`
          lesson_id,
          watched_seconds,
          updated_at,
          lessons (
            id,
            title,
            module_id,
            modules (
              course_id,
              courses (
                title,
                slug
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    enrollments: enrollments || [],
    certificates: certificates || [],
    stats,
    lastLesson,
    isLoading: enrollmentsLoading || certificatesLoading,
  };
}
