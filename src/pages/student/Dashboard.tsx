import { StudentLayout } from "@/components/student/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, Award, Clock, ArrowRight } from "lucide-react";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";
import { CourseCard } from "@/components/student/CourseCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { enrollments, stats, lastLesson, isLoading } = useStudentEnrollments();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Olá, bem-vindo de volta! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue de onde você parou e avance na sua jornada de closer.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso Geral
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.progressPercent}%</div>
              <Progress value={stats.progressPercent} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aulas Assistidas
              </CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedLessons}/{stats.totalLessons}
              </div>
              <p className="text-xs text-muted-foreground mt-1">aulas concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo de Estudo
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(stats.totalWatchedSeconds)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">total assistido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Certificados
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificatesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">conquistados</p>
            </CardContent>
          </Card>
        </div>

        {/* Continue Watching */}
        {lastLesson && (
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Continue de onde parou</p>
                    <h3 className="font-display font-semibold text-lg">
                      {(lastLesson.lessons as any)?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {(lastLesson.lessons as any)?.modules?.courses?.title}
                    </p>
                  </div>
                </div>
                <Link to={`/aluno/aula/${lastLesson.lesson_id}`}>
                  <Button className="gap-2">
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              Meus Cursos
            </h2>
            {enrollments.length > 0 && (
              <Link to="/aluno/cursos">
                <Button variant="ghost" className="gap-2">
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.slice(0, 3).map((course) => (
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
                  Nenhum curso disponível
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Você ainda não está matriculado em nenhum curso. Entre em contato com o suporte se você acredita que isso é um erro.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
