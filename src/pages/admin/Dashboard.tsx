import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  LayoutDashboard,
  BookOpen,
  FileText,
  UserCog,
  CreditCard,
  Link2,
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Cursos", href: "/admin/cursos" },
  { icon: Users, label: "Alunos", href: "/admin/alunos" },
  { icon: FileText, label: "CMS", href: "/admin/cms" },
  { icon: CreditCard, label: "Vendas", href: "/admin/vendas" },
  { icon: Link2, label: "Afiliados", href: "/admin/afiliados" },
  { icon: UserCog, label: "Usuários", href: "/admin/usuarios" },
  { icon: Settings, label: "Configurações", href: "/admin/config" },
];

export default function AdminDashboard() {
  const { user, signOut, roles } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden border-b border-border bg-sidebar sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="font-display text-lg font-bold">
            <span className="text-gradient">Formação</span> Closer
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
              <div className="font-display text-xl font-bold">
                <span className="text-gradient">Formação</span> Closer
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors mb-1"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {roles[0] || "Admin"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="hidden lg:flex">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Visão geral do seu negócio
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-success">+0%</span> vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Alunos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-success">+0</span> novos este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Conversão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    leads → vendas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Visitantes Hoje
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    página de vendas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas Recentes</CardTitle>
                  <CardDescription>Últimas vendas realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma venda registrada ainda
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leads Recentes</CardTitle>
                  <CardDescription>Últimos leads capturados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum lead capturado ainda
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}