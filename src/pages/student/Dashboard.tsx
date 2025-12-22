import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LogOut, PlayCircle, BookOpen, Award, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="font-display text-xl font-bold">
              <span className="text-gradient">Formação</span> Closer
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Olá, bem-vindo de volta! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue de onde você parou e avance na sua jornada de closer.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso Geral
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <Progress value={0} className="mt-2" />
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
              <div className="text-2xl font-bold">0/0</div>
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
              <div className="text-2xl font-bold">0h</div>
              <p className="text-xs text-muted-foreground mt-1">esta semana</p>
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">conquistados</p>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">
            Continue aprendendo
          </h2>
          
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
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">
            Ações rápidas
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-card/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Meus cursos</h3>
                  <p className="text-sm text-muted-foreground">Ver todos os cursos</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-card/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-medium">Certificados</h3>
                  <p className="text-sm text-muted-foreground">Ver certificados</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:bg-card/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium">Suporte</h3>
                  <p className="text-sm text-muted-foreground">Falar com suporte</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}