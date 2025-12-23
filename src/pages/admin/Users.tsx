import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Crown,
  Headphones,
  Briefcase,
  PenLine,
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
  Info,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AppRole = "owner" | "support" | "commercial" | "editor" | "financial";

const ADMIN_ROLES: AppRole[] = ["owner", "support", "commercial", "editor", "financial"];

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  owner: {
    label: "Owner",
    icon: <Crown className="h-3 w-3" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    description: "Acesso total ao sistema, pode gerenciar outros admins",
  },
  support: {
    label: "Suporte",
    icon: <Headphones className="h-3 w-3" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "Acesso a perfis de alunos e tickets de suporte",
  },
  commercial: {
    label: "Comercial",
    icon: <Briefcase className="h-3 w-3" />,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    description: "Gerencia leads, carrinhos abandonados e afiliados",
  },
  editor: {
    label: "Editor",
    icon: <PenLine className="h-3 w-3" />,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description: "Edita conteúdo do CMS e landing page",
  },
  financial: {
    label: "Financeiro",
    icon: <Wallet className="h-3 w-3" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    description: "Gerencia vendas, pagamentos e relatórios financeiros",
  },
};

interface UserWithRoles {
  user_id: string;
  full_name: string | null;
  email: string | null;
  roles: { id: string; role: AppRole; created_at: string }[];
}

export default function AdminUsers() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = hasRole("owner");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);

  // Add user form state
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<{ user_id: string; full_name: string | null; email: string | null } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [searchingUser, setSearchingUser] = useState(false);

  // Fetch admin users with their roles
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // First get all admin roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .in("role", ADMIN_ROLES);

      if (rolesError) throw rolesError;

      // Get unique user IDs
      const userIds = [...new Set(roles?.map((r) => r.user_id) || [])];

      if (userIds.length === 0) return [];

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Group roles by user
      const usersMap = new Map<string, UserWithRoles>();

      roles?.forEach((role) => {
        const profile = profiles?.find((p) => p.user_id === role.user_id);
        const existing = usersMap.get(role.user_id);

        if (existing) {
          existing.roles.push({
            id: role.id,
            role: role.role as AppRole,
            created_at: role.created_at,
          });
        } else {
          usersMap.set(role.user_id, {
            user_id: role.user_id,
            full_name: profile?.full_name || null,
            email: profile?.email || null,
            roles: [{
              id: role.id,
              role: role.role as AppRole,
              created_at: role.created_at,
            }],
          });
        }
      });

      return Array.from(usersMap.values());
    },
  });

  // Count owners for protection
  const ownerCount = adminUsers?.filter((u) =>
    u.roles.some((r) => r.role === "owner")
  ).length || 0;

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      const inserts = roles.map((role) => ({
        user_id: userId,
        role,
      }));

      const { error } = await supabase.from("user_roles").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Roles adicionadas com sucesso!");
      setAddModalOpen(false);
      resetAddForm();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar roles: ${error.message}`);
    },
  });

  // Update roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, newRoles, currentRoles }: {
      userId: string;
      newRoles: AppRole[];
      currentRoles: { id: string; role: AppRole }[];
    }) => {
      // Find roles to remove
      const rolesToRemove = currentRoles.filter(
        (cr) => !newRoles.includes(cr.role)
      );
      // Find roles to add
      const existingRoleNames = currentRoles.map((cr) => cr.role);
      const rolesToAdd = newRoles.filter(
        (nr) => !existingRoleNames.includes(nr)
      );

      // Remove old roles
      if (rolesToRemove.length > 0) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .in("id", rolesToRemove.map((r) => r.id));
        if (error) throw error;
      }

      // Add new roles
      if (rolesToAdd.length > 0) {
        const inserts = rolesToAdd.map((role) => ({
          user_id: userId,
          role,
        }));
        const { error } = await supabase.from("user_roles").insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Roles atualizadas com sucesso!");
      setEditModalOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar roles: ${error.message}`);
    },
  });

  // Remove all roles mutation
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .in("role", ADMIN_ROLES);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Acesso removido com sucesso!");
      setRemoveDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover acesso: ${error.message}`);
    },
  });

  const resetAddForm = () => {
    setSearchEmail("");
    setFoundUser(null);
    setSelectedRoles([]);
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;

    setSearchingUser(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .ilike("email", searchEmail.trim())
        .single();

      if (error || !data) {
        toast.error("Usuário não encontrado");
        setFoundUser(null);
      } else {
        // Check if user already has admin roles
        const existingUser = adminUsers?.find((u) => u.user_id === data.user_id);
        if (existingUser) {
          toast.error("Este usuário já possui roles administrativas");
          setFoundUser(null);
        } else {
          setFoundUser(data);
        }
      }
    } catch {
      toast.error("Erro ao buscar usuário");
    } finally {
      setSearchingUser(false);
    }
  };

  const handleAddUser = () => {
    if (!foundUser || selectedRoles.length === 0) return;
    addRoleMutation.mutate({ userId: foundUser.user_id, roles: selectedRoles });
  };

  const handleEditUser = (userItem: UserWithRoles) => {
    setSelectedUser(userItem);
    setSelectedRoles(userItem.roles.map((r) => r.role));
    setEditModalOpen(true);
  };

  const handleUpdateRoles = () => {
    if (!selectedUser) return;

    // Protection: Cannot remove last owner
    const isRemovingOwner = selectedUser.roles.some((r) => r.role === "owner") &&
      !selectedRoles.includes("owner");
    if (isRemovingOwner && ownerCount <= 1) {
      toast.error("Não é possível remover o último owner do sistema");
      return;
    }

    // Protection: Cannot remove all roles
    if (selectedRoles.length === 0) {
      toast.error("O usuário deve ter pelo menos uma role");
      return;
    }

    updateRolesMutation.mutate({
      userId: selectedUser.user_id,
      newRoles: selectedRoles,
      currentRoles: selectedUser.roles,
    });
  };

  const handleRemoveUser = (userItem: UserWithRoles) => {
    // Protection: Cannot remove self
    if (userItem.user_id === user?.id) {
      toast.error("Você não pode remover seu próprio acesso");
      return;
    }

    // Protection: Cannot remove last owner
    if (userItem.roles.some((r) => r.role === "owner") && ownerCount <= 1) {
      toast.error("Não é possível remover o último owner do sistema");
      return;
    }

    setSelectedUser(userItem);
    setRemoveDialogOpen(true);
  };

  const toggleRole = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  // Filter users
  const filteredUsers = adminUsers?.filter((userItem) => {
    const matchesSearch =
      searchTerm === "" ||
      userItem.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      userItem.roles.some((r) => r.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  // Calculate KPIs
  const kpis = {
    total: adminUsers?.length || 0,
    owner: adminUsers?.filter((u) => u.roles.some((r) => r.role === "owner")).length || 0,
    support: adminUsers?.filter((u) => u.roles.some((r) => r.role === "support")).length || 0,
    commercial: adminUsers?.filter((u) => u.roles.some((r) => r.role === "commercial")).length || 0,
    editor: adminUsers?.filter((u) => u.roles.some((r) => r.role === "editor")).length || 0,
    financial: adminUsers?.filter((u) => u.roles.some((r) => r.role === "financial")).length || 0,
  };

  return (
    <AdminLayout
      title="Usuários"
      description="Gerencie usuários administrativos e permissões"
    >
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owners</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.owner}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suporte</CardTitle>
            <Headphones className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.support}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comercial</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.commercial}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editores</CardTitle>
            <PenLine className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.editor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financeiro</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.financial}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-[250px]"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as roles</SelectItem>
                {ADMIN_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleConfig[role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isOwner && (
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Admin
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  {isOwner && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userItem) => (
                  <TableRow key={userItem.user_id}>
                    <TableCell className="font-medium">
                      {userItem.full_name || "—"}
                      {userItem.user_id === user?.id && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Você
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{userItem.email || "—"}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-1">
                          {userItem.roles.map((role) => (
                            <Tooltip key={role.id}>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className={`${roleConfig[role.role].color} gap-1`}
                                >
                                  {roleConfig[role.role].icon}
                                  {roleConfig[role.role].label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{roleConfig[role.role].description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(Math.min(...userItem.roles.map((r) => new Date(r.created_at).getTime()))),
                        "dd/MM/yyyy",
                        { locale: ptBR }
                      )}
                    </TableCell>
                    {isOwner && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(userItem)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUser(userItem)}
                            disabled={userItem.user_id === user?.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserPlus className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || roleFilter !== "all"
                  ? "Nenhum usuário encontrado"
                  : "Você é o único administrador"}
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {searchTerm || roleFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Adicione outros membros da equipe para ajudar a gerenciar a plataforma."}
              </p>
              {isOwner && !searchTerm && roleFilter === "all" && (
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Admin
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={addModalOpen} onOpenChange={(open) => {
        setAddModalOpen(open);
        if (!open) resetAddForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário Administrativo</DialogTitle>
            <DialogDescription>
              Busque um usuário existente pelo email e atribua roles administrativas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Email do usuário"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
              />
              <Button
                variant="secondary"
                onClick={handleSearchUser}
                disabled={searchingUser}
              >
                {searchingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {foundUser && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="font-medium">{foundUser.full_name || "Sem nome"}</p>
                <p className="text-sm text-muted-foreground">{foundUser.email}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Roles
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Selecione uma ou mais roles para o usuário</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {ADMIN_ROLES.map((role) => (
                  <div
                    key={role}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`add-${role}`}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                      disabled={!foundUser}
                    />
                    <Label
                      htmlFor={`add-${role}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {roleConfig[role].icon}
                      {roleConfig[role].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddModalOpen(false);
                resetAddForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!foundUser || selectedRoles.length === 0 || addRoleMutation.isPending}
            >
              {addRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Roles Modal */}
      <Dialog open={editModalOpen} onOpenChange={(open) => {
        setEditModalOpen(open);
        if (!open) {
          setSelectedUser(null);
          setSelectedRoles([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Roles</DialogTitle>
            <DialogDescription>
              Modifique as roles de {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="font-medium">{selectedUser?.full_name || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            </div>

            <div className="space-y-3">
              <Label>Roles</Label>
              <div className="grid grid-cols-2 gap-3">
                {ADMIN_ROLES.map((role) => {
                  const isLastOwner =
                    role === "owner" &&
                    selectedUser?.roles.some((r) => r.role === "owner") &&
                    ownerCount <= 1;

                  return (
                    <div
                      key={role}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                        disabled={isLastOwner && selectedRoles.includes(role)}
                      />
                      <Label
                        htmlFor={`edit-${role}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {roleConfig[role].icon}
                        {roleConfig[role].label}
                        {isLastOwner && (
                          <span className="text-xs text-muted-foreground">(último)</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedUser(null);
                setSelectedRoles([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateRoles}
              disabled={selectedRoles.length === 0 || updateRolesMutation.isPending}
            >
              {updateRolesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso administrativo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover todas as roles administrativas de{" "}
              <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
              <br />
              <br />
              Esta ação pode ser desfeita adicionando o usuário novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && removeUserMutation.mutate(selectedUser.user_id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remover Acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
