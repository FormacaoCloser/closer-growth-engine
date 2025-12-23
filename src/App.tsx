import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Enrollment from "./pages/Enrollment";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/student/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/Courses";
import AdminModules from "./pages/admin/Modules";
import AdminLessons from "./pages/admin/Lessons";
import AdminStudents from "./pages/admin/Students";
import AdminCMS from "./pages/admin/CMS";
import AdminSales from "./pages/admin/Sales";
import AdminAffiliates from "./pages/admin/Affiliates";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/matricula" element={<Enrollment />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/contato" element={<Contact />} />
            
            {/* Student Routes */}
            <Route
              path="/aluno"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aluno/*"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cursos"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cursos/:courseId/modulos"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminModules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cursos/:courseId/modulos/:moduleId/aulas"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/alunos"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cms"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCMS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vendas"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/afiliados"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAffiliates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/config"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;