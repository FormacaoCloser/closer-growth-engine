import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Users, 
  LayoutDashboard,
  BookOpen,
  FileText,
  UserCog,
  CreditCard,
  Link2,
  Settings,
  Menu,
  X,
  ChevronLeft,
  QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Cursos", href: "/admin/cursos" },
  { icon: Users, label: "Alunos", href: "/admin/alunos" },
  { icon: FileText, label: "CMS", href: "/admin/cms" },
  { icon: CreditCard, label: "Vendas", href: "/admin/vendas" },
  { icon: QrCode, label: "Pix Pendentes", href: "/admin/pix" },
  { icon: Link2, label: "Afiliados", href: "/admin/afiliados" },
  { icon: UserCog, label: "Usuários", href: "/admin/usuarios" },
  { icon: Settings, label: "Configurações", href: "/admin/config" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  backLink?: {
    label: string;
    href: string;
  };
}

export function AdminLayout({ children, title, description, backLink }: AdminLayoutProps) {
  const { user, signOut, roles } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

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
              <Link to="/admin" className="font-display text-xl font-bold">
                <span className="text-gradient">Formação</span> Closer
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
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
              {backLink && (
                <Link 
                  to={backLink.href}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {backLink.label}
                </Link>
              )}
              <h1 className="font-display text-3xl font-bold mb-2">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
