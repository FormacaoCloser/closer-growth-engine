import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StudentLayout } from "@/components/student/StudentLayout";
import { LessonVideoPlayer } from "@/components/student/LessonVideoPlayer";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Download, 
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export default function StudentLessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch lesson data
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ["student-lesson", lessonId, user?.id],
    queryFn: async () => {
      if (!user?.id || !lessonId) return null;

      // Get lesson with module and course
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select(`
          *,
          modules (
            id,
            title,
            course_id,
            courses (
              id,
              title,
              slug
            )
          )
        `)
        .eq("id", lessonId)
        .eq("is_active", true)
        .single();

      if (lessonError || !lesson) return null;

      const courseId = (lesson.modules as any)?.course_id;

      // Verify enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single();

      if (enrollmentError || !enrollment) return null;

      // Get lesson materials
      const { data: materials } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", lessonId);

      // Get all lessons from course for navigation
      const { data: allModules } = await supabase
        .from("modules")
        .select(`
          id,
          sort_order,
          lessons (
            id,
            title,
            sort_order
          )
        `)
        .eq("course_id", courseId)
        .eq("is_active", true)
        .order("sort_order");

      // Flatten lessons for navigation
      const allLessons = allModules
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .flatMap(m => 
          m.lessons
            ?.sort((a, b) => a.sort_order - b.sort_order)
            .map(l => ({ ...l, moduleId: m.id })) || []
        ) || [];

      const currentIndex = allLessons.findIndex(l => l.id === lessonId);
      const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

      return {
        lesson,
        materials: materials || [],
        navigation: {
          prevLesson,
          nextLesson,
          currentIndex: currentIndex + 1,
          totalLessons: allLessons.length,
        },
      };
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Progress hook
  const { 
    updateProgress, 
    markComplete, 
    isCompleted, 
    initialTime 
  } = useLessonProgress({
    lessonId: lessonId || "",
    videoDuration: lessonData?.lesson?.video_duration_seconds || 0,
  });

  const handleComplete = async () => {
    await markComplete();
    toast.success("Aula marcada como concluída!");
  };

  const handleVideoComplete = () => {
    if (!isCompleted) {
      markComplete();
      toast.success("Aula concluída!");
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-24" />
        </div>
      </StudentLayout>
    );
  }

  if (!lessonData) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Aula não encontrada
          </h2>
          <p className="text-muted-foreground mb-6">
            A aula não existe ou você não tem acesso.
          </p>
          <Link to="/aluno/cursos">
            <Button>Ver meus cursos</Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { lesson, materials, navigation } = lessonData;
  const course = (lesson.modules as any)?.courses;
  const module = lesson.modules as any;

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back to Course */}
        <Link to={`/aluno/curso/${course?.slug}`}>
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            {course?.title}
          </Button>
        </Link>

        {/* Video Player */}
        <LessonVideoPlayer
          videoUrl={lesson.video_url}
          initialTime={initialTime}
          onTimeUpdate={updateProgress}
          onComplete={handleVideoComplete}
        />

        {/* Lesson Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {module?.title}
              </p>
              <h1 className="font-display text-2xl font-bold">
                {lesson.title}
              </h1>
            </div>

            {/* Complete Button */}
            <Button
              variant={isCompleted ? "secondary" : "default"}
              className="gap-2 flex-shrink-0"
              onClick={handleComplete}
              disabled={isCompleted}
            >
              <CheckCircle className="w-4 h-4" />
              {isCompleted ? "Concluída" : "Marcar como concluída"}
            </Button>
          </div>

          {lesson.description && (
            <p className="text-muted-foreground">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Materials */}
        {materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Materiais complementares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{material.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.file_type || "Arquivo"}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {navigation.prevLesson ? (
              <Link to={`/aluno/aula/${navigation.prevLesson.id}`}>
                <Button variant="outline" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Aula anterior
                </Button>
              </Link>
            ) : (
              <Button variant="outline" disabled className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Aula anterior
              </Button>
            )}
          </div>

          <span className="text-sm text-muted-foreground">
            {navigation.currentIndex} de {navigation.totalLessons}
          </span>

          <div>
            {navigation.nextLesson ? (
              <Link to={`/aluno/aula/${navigation.nextLesson.id}`}>
                <Button className="gap-2">
                  Próxima aula
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to={`/aluno/curso/${course?.slug}`}>
                <Button className="gap-2">
                  Voltar ao curso
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
