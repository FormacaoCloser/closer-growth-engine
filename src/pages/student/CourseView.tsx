import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ModuleAccordion } from "@/components/student/ModuleAccordion";
import { useDripContent } from "@/hooks/useDripContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, Award } from "lucide-react";

export default function StudentCourseView() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  // Fetch course with enrollment
  const { data: courseData, isLoading } = useQuery({
    queryKey: ["student-course", slug, user?.id],
    queryFn: async () => {
      if (!user?.id || !slug) return null;

      // Get course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (courseError || !course) return null;

      // Check enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .eq("status", "active")
        .single();

      if (enrollmentError || !enrollment) return null;

      // Get modules with lessons
      const { data: modules } = await supabase
        .from("modules")
        .select(`
          id,
          title,
          description,
          sort_order,
          drip_days,
          lessons (
            id,
            title,
            description,
            video_duration_seconds,
            is_free,
            sort_order
          )
        `)
        .eq("course_id", course.id)
        .eq("is_active", true)
        .order("sort_order");

      // Get lesson progress
      const lessonIds = modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [];
      
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed, watched_seconds")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      // Map progress to lessons
      const progressMap = new Map(
        progress?.map(p => [p.lesson_id, p]) || []
      );

      const modulesWithProgress = modules?.map(module => ({
        ...module,
        lessons: module.lessons?.map(lesson => ({
          ...lesson,
          isCompleted: progressMap.get(lesson.id)?.is_completed || false,
          watchedSeconds: progressMap.get(lesson.id)?.watched_seconds || 0,
        })) || [],
      })) || [];

      // Calculate stats
      const totalLessons = modulesWithProgress.reduce(
        (sum, m) => sum + m.lessons.length, 0
      );
      const completedLessons = modulesWithProgress.reduce(
        (sum, m) => sum + m.lessons.filter(l => l.isCompleted).length, 0
      );
      const totalDuration = modulesWithProgress.reduce(
        (sum, m) => sum + m.lessons.reduce(
          (s, l) => s + (l.video_duration_seconds || 0), 0
        ), 0
      );

      return {
        course,
        enrollment,
        modules: modulesWithProgress,
        stats: {
          totalLessons,
          completedLessons,
          totalDuration,
          progressPercent: totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100) 
            : 0,
        },
      };
    },
    enabled: !!user?.id && !!slug,
  });

  const { checkModuleAvailability } = useDripContent(
    courseData?.enrollment?.enrolled_at || new Date()
  );

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!courseData) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Curso não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O curso não existe ou você não está matriculado.
          </p>
          <Link to="/aluno/cursos">
            <Button>Ver meus cursos</Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { course, modules, stats } = courseData;
  const dripStatusMap = checkModuleAvailability(modules);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/aluno/cursos">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        {/* Course Header */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-muted-foreground text-lg">
              {course.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{stats.totalLessons} aulas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatDuration(stats.totalDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span>{stats.progressPercent}% concluído</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso do curso</span>
              <span className="font-medium">
                {stats.completedLessons}/{stats.totalLessons} aulas
              </span>
            </div>
            <Progress value={stats.progressPercent} className="h-3" />
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">
            Conteúdo do curso
          </h2>

          <div className="space-y-3">
            {modules
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((module, index) => {
                const dripStatus = dripStatusMap.get(module.id) || {
                  isAvailable: true,
                  formattedMessage: "",
                };

                return (
                  <ModuleAccordion
                    key={module.id}
                    id={module.id}
                    title={module.title}
                    description={module.description}
                    lessons={module.lessons}
                    isAvailable={dripStatus.isAvailable}
                    dripMessage={dripStatus.formattedMessage}
                    defaultOpen={index === 0 || module.lessons.some(l => !l.isCompleted)}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
