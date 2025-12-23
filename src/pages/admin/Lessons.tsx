import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, PlayCircle, Clock, ChevronUp, ChevronDown, FileText, ExternalLink, Gift } from "lucide-react";
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

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  sort_order: number;
  is_active: boolean;
  is_free: boolean;
}

interface Material {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

interface LessonFormData {
  title: string;
  description: string;
  video_url: string;
  video_duration_seconds: number;
  is_active: boolean;
  is_free: boolean;
}

interface MaterialFormData {
  title: string;
  file_url: string;
  file_type: string;
}

export default function AdminLessons() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const queryClient = useQueryClient();
  
  // Lesson dialog state
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    video_url: "",
    video_duration_seconds: 0,
    is_active: true,
    is_free: false,
  });

  // Material dialog state
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [selectedLessonForMaterial, setSelectedLessonForMaterial] = useState<Lesson | null>(null);
  const [materialFormData, setMaterialFormData] = useState<MaterialFormData>({
    title: "",
    file_url: "",
    file_type: "pdf",
  });

  // Fetch module info
  const { data: module } = useQuery({
    queryKey: ["admin-module", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("id", moduleId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch lessons
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
  });

  // Fetch materials for all lessons
  const { data: materials } = useQuery({
    queryKey: ["admin-materials", moduleId],
    queryFn: async () => {
      if (!lessons || lessons.length === 0) return [];
      
      const lessonIds = lessons.map((l) => l.id);
      const { data, error } = await supabase
        .from("lesson_materials")
        .select("*")
        .in("lesson_id", lessonIds);
      
      if (error) throw error;
      return data as Material[];
    },
    enabled: !!lessons && lessons.length > 0,
  });

  const saveLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      if (editingLesson) {
        const { error } = await supabase
          .from("lessons")
          .update(data)
          .eq("id", editingLesson.id);
        if (error) throw error;
      } else {
        const maxOrder = lessons?.reduce((max, l) => Math.max(max, l.sort_order), -1) ?? -1;
        const { error } = await supabase
          .from("lessons")
          .insert({
            ...data,
            module_id: moduleId,
            sort_order: maxOrder + 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", moduleId] });
      toast.success(editingLesson ? "Aula atualizada!" : "Aula criada!");
      closeLessonDialog();
    },
    onError: (error) => {
      toast.error("Erro ao salvar aula: " + error.message);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", moduleId] });
      toast.success("Aula excluída!");
      setDeletingLesson(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir aula: " + error.message);
    },
  });

  const saveMaterialMutation = useMutation({
    mutationFn: async (data: MaterialFormData & { lesson_id: string }) => {
      const { error } = await supabase
        .from("lesson_materials")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials", moduleId] });
      toast.success("Material adicionado!");
      closeMaterialDialog();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar material: " + error.message);
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from("lesson_materials")
        .delete()
        .eq("id", materialId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials", moduleId] });
      toast.success("Material excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir material: " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ lessonId, newOrder }: { lessonId: string; newOrder: number }) => {
      const { error } = await supabase
        .from("lessons")
        .update({ sort_order: newOrder })
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", moduleId] });
    },
  });

  const openCreateLessonDialog = () => {
    setEditingLesson(null);
    setLessonFormData({
      title: "",
      description: "",
      video_url: "",
      video_duration_seconds: 0,
      is_active: true,
      is_free: false,
    });
    setIsLessonDialogOpen(true);
  };

  const openEditLessonDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      video_duration_seconds: lesson.video_duration_seconds || 0,
      is_active: lesson.is_active,
      is_free: lesson.is_free,
    });
    setIsLessonDialogOpen(true);
  };

  const closeLessonDialog = () => {
    setIsLessonDialogOpen(false);
    setEditingLesson(null);
  };

  const openMaterialDialog = (lesson: Lesson) => {
    setSelectedLessonForMaterial(lesson);
    setMaterialFormData({
      title: "",
      file_url: "",
      file_type: "pdf",
    });
    setIsMaterialDialogOpen(true);
  };

  const closeMaterialDialog = () => {
    setIsMaterialDialogOpen(false);
    setSelectedLessonForMaterial(null);
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveLessonMutation.mutate(lessonFormData);
  };

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLessonForMaterial) {
      saveMaterialMutation.mutate({
        ...materialFormData,
        lesson_id: selectedLessonForMaterial.id,
      });
    }
  };

  const moveLesson = (lesson: Lesson, direction: "up" | "down") => {
    if (!lessons) return;
    
    const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    
    const targetLesson = lessons[targetIndex];
    
    reorderMutation.mutate({ lessonId: lesson.id, newOrder: targetLesson.sort_order });
    reorderMutation.mutate({ lessonId: targetLesson.id, newOrder: lesson.sort_order });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLessonMaterials = (lessonId: string) => {
    return materials?.filter((m) => m.lesson_id === lessonId) || [];
  };

  return (
    <AdminLayout
      title={module ? `Aulas: ${module.title}` : "Aulas"}
      description="Gerencie as aulas e materiais do módulo"
      backLink={{
        label: "Voltar para Módulos",
        href: `/admin/cursos/${courseId}/modulos`,
      }}
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex justify-end">
          <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateLessonDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleLessonSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingLesson ? "Editar Aula" : "Nova Aula"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLesson
                      ? "Atualize as informações da aula"
                      : "Adicione uma nova aula ao módulo"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={lessonFormData.title}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                      placeholder="Aula 1: Introdução ao método"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={lessonFormData.description}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                      placeholder="Descreva o conteúdo da aula..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video_url">URL do Vídeo</Label>
                    <Input
                      id="video_url"
                      value={lessonFormData.video_url}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, video_url: e.target.value })}
                      placeholder="https://iframe.mediadelivery.net/embed/..."
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole a URL de embed do Bunny CDN ou outro player
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (segundos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={0}
                      value={lessonFormData.video_duration_seconds}
                      onChange={(e) =>
                        setLessonFormData({
                          ...lessonFormData,
                          video_duration_seconds: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="600"
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional: para mostrar duração na lista de aulas
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="is_active"
                        checked={lessonFormData.is_active}
                        onCheckedChange={(checked) =>
                          setLessonFormData({ ...lessonFormData, is_active: checked })
                        }
                      />
                      <Label htmlFor="is_active">Aula ativa</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="is_free"
                        checked={lessonFormData.is_free}
                        onCheckedChange={(checked) =>
                          setLessonFormData({ ...lessonFormData, is_free: checked })
                        }
                      />
                      <Label htmlFor="is_free">Aula gratuita</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeLessonDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveLessonMutation.isPending}>
                    {saveLessonMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingLesson ? "Salvar" : "Criar Aula"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lesson List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const lessonMaterials = getLessonMaterials(lesson.id);
              
              return (
                <Card key={lesson.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Reorder Controls */}
                      <div className="flex flex-col gap-1 pt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveLesson(lesson, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveLesson(lesson, "down")}
                          disabled={index === lessons.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <Badge variant={lesson.is_active ? "default" : "secondary"}>
                            {lesson.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                          {lesson.is_free && (
                            <Badge variant="outline" className="text-success border-success">
                              <Gift className="h-3 w-3 mr-1" />
                              Gratuita
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {lesson.description || "Sem descrição"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {lesson.video_url && (
                            <span className="flex items-center gap-1">
                              <PlayCircle className="h-3 w-3" />
                              Vídeo configurado
                            </span>
                          )}
                          {lesson.video_duration_seconds && lesson.video_duration_seconds > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(lesson.video_duration_seconds)}
                            </span>
                          )}
                          {lessonMaterials.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {lessonMaterials.length} material(is)
                            </span>
                          )}
                        </div>

                        {/* Materials */}
                        {lessonMaterials.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {lessonMaterials.map((material) => (
                              <div
                                key={material.id}
                                className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1 text-xs"
                              >
                                <FileText className="h-3 w-3" />
                                <span>{material.title}</span>
                                <a
                                  href={material.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                                <button
                                  onClick={() => deleteMaterialMutation.mutate(material.id)}
                                  className="hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMaterialDialog(lesson)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditLessonDialog(lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingLesson(lesson)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PlayCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma aula cadastrada ainda
              </p>
              <Button onClick={openCreateLessonDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira aula
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Material Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleMaterialSubmit}>
            <DialogHeader>
              <DialogTitle>Adicionar Material</DialogTitle>
              <DialogDescription>
                Adicione um material de apoio para a aula "{selectedLessonForMaterial?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="material_title">Título do Material</Label>
                <Input
                  id="material_title"
                  value={materialFormData.title}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                  placeholder="Apostila do módulo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_url">URL do Arquivo</Label>
                <Input
                  id="file_url"
                  value={materialFormData.file_url}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, file_url: e.target.value })}
                  placeholder="https://exemplo.com/arquivo.pdf"
                  type="url"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_type">Tipo de Arquivo</Label>
                <Input
                  id="file_type"
                  value={materialFormData.file_type}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, file_type: e.target.value })}
                  placeholder="pdf"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeMaterialDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMaterialMutation.isPending}>
                {saveMaterialMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingLesson} onOpenChange={() => setDeletingLesson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aula?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A aula "{deletingLesson?.title}" e todos os seus materiais serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingLesson && deleteLessonMutation.mutate(deletingLesson.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLessonMutation.isPending ? (
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
