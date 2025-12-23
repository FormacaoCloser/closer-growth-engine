import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  expires_at: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface StudentWithEnrollments extends StudentProfile {
  enrollments: Enrollment[];
}

interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
  watched_seconds: number;
  lesson: {
    id: string;
    title: string;
    video_duration_seconds: number | null;
    module: {
      id: string;
      title: string;
      course_id: string;
    } | null;
  } | null;
}

// Fetch students with enrollments
async function fetchStudents(): Promise<StudentWithEnrollments[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  // Get enrollments for all users
  const userIds = profiles.map((p) => p.user_id);
  
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(`
      id,
      course_id,
      status,
      enrolled_at,
      expires_at,
      course:courses (
        id,
        title,
        slug
      )
    `)
    .in("user_id", userIds);

  if (enrollmentsError) throw enrollmentsError;

  // Map enrollments to profiles
  return profiles.map((profile) => ({
    ...profile,
    enrollments: (enrollments || [])
      .filter((e) => {
        // Need to find the user_id for this enrollment
        return true; // We'll filter by checking if the enrollment belongs to this user
      })
      .map((e) => ({
        ...e,
        course: Array.isArray(e.course) ? e.course[0] : e.course,
      })),
  }));
}

// Fetch students with enrollments properly linked
async function fetchStudentsWithEnrollments(): Promise<StudentWithEnrollments[]> {
  // First get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  // Then get all enrollments with course info
  const { data: allEnrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(`
      id,
      user_id,
      course_id,
      status,
      enrolled_at,
      expires_at,
      course:courses (
        id,
        title,
        slug
      )
    `);

  if (enrollmentsError) throw enrollmentsError;

  // Map enrollments to each profile
  return profiles.map((profile) => ({
    ...profile,
    enrollments: (allEnrollments || [])
      .filter((e) => e.user_id === profile.user_id)
      .map((e) => ({
        id: e.id,
        course_id: e.course_id,
        status: e.status,
        enrolled_at: e.enrolled_at,
        expires_at: e.expires_at,
        course: Array.isArray(e.course) ? e.course[0] : e.course,
      })),
  }));
}

// Fetch student progress
async function fetchStudentProgress(userId: string): Promise<LessonProgress[]> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      is_completed,
      watched_seconds,
      lesson:lessons (
        id,
        title,
        video_duration_seconds,
        module:modules (
          id,
          title,
          course_id
        )
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    lesson: Array.isArray(p.lesson) ? p.lesson[0] : p.lesson,
  }));
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Ativo</Badge>;
    case "expired":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Expirado</Badge>;
    case "cancelled":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelado</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithEnrollments | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: fetchStudentsWithEnrollments,
  });

  const { data: studentProgress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["student-progress", selectedStudent?.user_id],
    queryFn: () => fetchStudentProgress(selectedStudent!.user_id),
    enabled: !!selectedStudent?.user_id,
  });

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !search ||
      student.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase());

    const hasEnrollment = student.enrollments.length > 0;
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "enrolled") return matchesSearch && hasEnrollment;
    if (statusFilter === "no-enrollment") return matchesSearch && !hasEnrollment;
    
    return matchesSearch && student.enrollments.some((e) => e.status === statusFilter);
  });

  // Calculate stats
  const totalStudents = students.length;
  const enrolledStudents = students.filter((s) => s.enrollments.length > 0).length;
  const activeEnrollments = students.filter((s) => 
    s.enrollments.some((e) => e.status === "active")
  ).length;

  // Calculate progress for selected student
  const calculateCourseProgress = (courseId: string) => {
    const courseLessons = studentProgress.filter(
      (p) => p.lesson?.module?.course_id === courseId
    );
    if (courseLessons.length === 0) return 0;
    
    const completedLessons = courseLessons.filter((p) => p.is_completed).length;
    return Math.round((completedLessons / courseLessons.length) * 100);
  };

  const handleViewStudent = (student: StudentWithEnrollments) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout title="Alunos" description="Gerencie os alunos matriculados">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <GraduationCap className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enrolledStudents}</p>
              <p className="text-sm text-muted-foreground">Alunos Matriculados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-accent/10 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeEnrollments}</p>
              <p className="text-sm text-muted-foreground">Matrículas Ativas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="enrolled">Com Matrícula</SelectItem>
                <SelectItem value="no-enrollment">Sem Matrícula</SelectItem>
                <SelectItem value="active">Matrícula Ativa</SelectItem>
                <SelectItem value="expired">Matrícula Expirada</SelectItem>
                <SelectItem value="cancelled">Matrícula Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhum aluno encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(student.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.full_name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {student.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.enrollments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.enrollments.map((enrollment) => (
                              <Badge key={enrollment.id} variant="outline" className="text-xs">
                                {enrollment.course?.title || "Curso"}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Nenhum curso</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.enrollments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.enrollments.map((enrollment) => (
                              <div key={enrollment.id}>
                                {getStatusBadge(enrollment.status)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary">Sem matrícula</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(student.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedStudent?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(selectedStudent?.full_name || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedStudent?.full_name || "Sem nome"}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {selectedStudent?.email}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Detalhes do aluno e progresso nos cursos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedStudent?.email || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{selectedStudent?.phone || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cadastro em</p>
                <p className="font-medium">
                  {selectedStudent?.created_at
                    ? format(new Date(selectedStudent.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                    : "-"}
                </p>
              </div>
            </div>

            {/* Enrollments & Progress */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Cursos Matriculados
              </h4>

              {selectedStudent?.enrollments.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma matrícula encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {selectedStudent?.enrollments.map((enrollment) => {
                    const progress = calculateCourseProgress(enrollment.course_id);
                    
                    return (
                      <Card key={enrollment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium">{enrollment.course?.title || "Curso"}</p>
                              <p className="text-sm text-muted-foreground">
                                Matriculado em{" "}
                                {format(new Date(enrollment.enrolled_at), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            {getStatusBadge(enrollment.status)}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {isLoadingProgress && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Carregando progresso...
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lesson Progress Details */}
            {studentProgress.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Aulas Assistidas
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {studentProgress.map((progress) => (
                    <div
                      key={progress.lesson_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {progress.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{progress.lesson?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {progress.lesson?.module?.title}
                          </p>
                        </div>
                      </div>
                      <Badge variant={progress.is_completed ? "default" : "secondary"}>
                        {progress.is_completed ? "Concluída" : "Em andamento"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
