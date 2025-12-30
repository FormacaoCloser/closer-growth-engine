import { StudentLayout } from "@/components/student/StudentLayout";
import { CourseCard } from "@/components/student/CourseCard";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function StudentCourses() {
  const { enrollments, isLoading } = useStudentEnrollments();

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Meus Cursos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso dos seus cursos matriculados.
          </p>
        </div>

        {/* Courses Grid */}
        {enrollments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                Nenhum curso matriculado
              </h3>
              <p className="text-muted-foreground max-w-md">
                Você ainda não está matriculado em nenhum curso.
              </p>
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
