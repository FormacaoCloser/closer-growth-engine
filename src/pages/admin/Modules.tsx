import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Edit, Trash2, Loader2, Layers, PlayCircle, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  drip_days: number | null;
  is_active: boolean;
  lesson_count?: number;
}

interface ModuleFormData {
  title: string;
  description: string;
  drip_days: number;
  is_active: boolean;
}

export default function AdminModules() {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    drip_days: 0,
    is_active: true,
  });

  // Fetch course info
  const { data: course } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch modules with lesson count
  const { data: modules, isLoading } = useQuery({
    queryKey: ["admin-modules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select(`
          *,
          lessons:lessons(count)
        `)
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      
      return data.map((m: any) => ({
        ...m,
        lesson_count: m.lessons?.[0]?.count || 0,
      })) as Module[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ModuleFormData) => {
      if (editingModule) {
        const { error } = await supabase
          .from("modules")
          .update(data)
          .eq("id", editingModule.id);
        if (error) throw error;
      } else {
        const maxOrder = modules?.reduce((max, m) => Math.max(max, m.sort_order), -1) ?? -1;
        const { error } = await supabase
          .from("modules")
          .insert({
            ...data,
            course_id: courseId,
            sort_order: maxOrder + 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", courseId] });
      toast.success(editingModule ? "Módulo atualizado!" : "Módulo criado!");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao salvar módulo: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", courseId] });
      toast.success("Módulo excluído!");
      setDeletingModule(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir módulo: " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ moduleId, newOrder }: { moduleId: string; newOrder: number }) => {
      const { error } = await supabase
        .from("modules")
        .update({ sort_order: newOrder })
        .eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", courseId] });
    },
  });

  const openCreateDialog = () => {
    setEditingModule(null);
    setFormData({
      title: "",
      description: "",
      drip_days: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      drip_days: module.drip_days || 0,
      is_active: module.is_active,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingModule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const moveModule = (module: Module, direction: "up" | "down") => {
    if (!modules) return;
    
    const currentIndex = modules.findIndex((m) => m.id === module.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    
    const targetModule = modules[targetIndex];
    
    // Swap sort_order values
    reorderMutation.mutate({ moduleId: module.id, newOrder: targetModule.sort_order });
    reorderMutation.mutate({ moduleId: targetModule.id, newOrder: module.sort_order });
  };

  return (
    <AdminLayout
      title={course ? `Módulos: ${course.title}` : "Módulos"}
      description="Organize o conteúdo do curso em módulos"
      backLink={{
        label: "Voltar para Cursos",
        href: "/admin/cursos",
      }}
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingModule ? "Editar Módulo" : "Novo Módulo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingModule
                      ? "Atualize as informações do módulo"
                      : "Crie um novo módulo para este curso"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Módulo 1: Introdução"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o módulo..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drip_days">
                      Liberação (dias após matrícula)
                    </Label>
                    <Input
                      id="drip_days"
                      type="number"
                      min={0}
                      value={formData.drip_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          drip_days: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      0 = disponível imediatamente
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Módulo ativo</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingModule ? "Salvar" : "Criar Módulo"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Module List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : modules && modules.length > 0 ? (
          <div className="space-y-3">
            {modules.map((module, index) => (
              <Card key={module.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Reorder Controls */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveModule(module, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveModule(module, "down")}
                        disabled={index === modules.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{module.title}</h3>
                        <Badge variant={module.is_active ? "default" : "secondary"} className="shrink-0">
                          {module.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {module.drip_days && module.drip_days > 0 && (
                          <Badge variant="outline" className="shrink-0">
                            +{module.drip_days} dias
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {module.description || "Sem descrição"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-3 w-3" />
                          {module.lesson_count || 0} aulas
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(module)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingModule(module)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button asChild size="sm">
                        <Link to={`/admin/cursos/${courseId}/modulos/${module.id}/aulas`}>
                          <Layers className="h-4 w-4 mr-1" />
                          Aulas
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum módulo cadastrado ainda
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro módulo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingModule} onOpenChange={() => setDeletingModule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O módulo "{deletingModule?.title}" e todas as suas aulas serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingModule && deleteMutation.mutate(deletingModule.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
