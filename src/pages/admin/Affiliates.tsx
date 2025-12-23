import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Clock,
  Search,
  Plus,
  Copy,
  Eye,
  Pencil,
  Banknote,
  Power,
  Link2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Affiliate = {
  id: string;
  user_id: string;
  affiliate_code: string;
  commission_percent: number;
  is_active: boolean;
  total_sales: number;
  total_earnings_cents: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

type Payout = {
  id: string;
  affiliate_id: string;
  amount_cents: number;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
};

type Order = {
  id: string;
  amount_cents: number;
  affiliate_commission_cents: number | null;
  status: string;
  created_at: string;
  paid_at: string | null;
  course?: {
    title: string;
  } | null;
};

export default function AdminAffiliates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  
  // Form states
  const [newAffiliateUserId, setNewAffiliateUserId] = useState("");
  const [newAffiliateCode, setNewAffiliateCode] = useState("");
  const [newCommissionPercent, setNewCommissionPercent] = useState("10");
  const [editCommissionPercent, setEditCommissionPercent] = useState("");
  const [editAffiliateCode, setEditAffiliateCode] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Fetch affiliates
  const { data: affiliates = [], isLoading: loadingAffiliates } = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data.map((a) => a.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      return data.map((affiliate) => ({
        ...affiliate,
        profile: profiles?.find((p) => p.user_id === affiliate.user_id) || null,
      })) as Affiliate[];
    },
  });

  // Fetch payouts for stats
  const { data: allPayouts = [] } = useQuery({
    queryKey: ["admin-affiliate-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_payouts")
        .select("*");

      if (error) throw error;
      return data as Payout[];
    },
  });

  // Fetch users without affiliate account for creating new affiliates
  const { data: availableUsers = [] } = useQuery({
    queryKey: ["available-users-for-affiliate"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");

      if (error) throw error;

      const { data: existingAffiliates } = await supabase
        .from("affiliates")
        .select("user_id");

      const existingUserIds = new Set(existingAffiliates?.map((a) => a.user_id) || []);

      return profiles?.filter((p) => !existingUserIds.has(p.user_id)) || [];
    },
  });

  // Fetch affiliate details (orders and payouts)
  const { data: affiliateDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["affiliate-details", selectedAffiliate?.id],
    queryFn: async () => {
      if (!selectedAffiliate) return null;

      const [ordersRes, payoutsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*, course:courses(title)")
          .eq("affiliate_id", selectedAffiliate.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("affiliate_payouts")
          .select("*")
          .eq("affiliate_id", selectedAffiliate.id)
          .order("created_at", { ascending: false }),
      ]);

      return {
        orders: (ordersRes.data || []) as Order[],
        payouts: (payoutsRes.data || []) as Payout[],
      };
    },
    enabled: !!selectedAffiliate && (detailsModalOpen || paymentModalOpen),
  });

  // Create affiliate mutation
  const createAffiliateMutation = useMutation({
    mutationFn: async () => {
      const code = newAffiliateCode || (await generateAffiliateCode());
      const { error } = await supabase.from("affiliates").insert({
        user_id: newAffiliateUserId,
        affiliate_code: code,
        commission_percent: parseFloat(newCommissionPercent),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["available-users-for-affiliate"] });
      setCreateModalOpen(false);
      resetCreateForm();
      toast({ title: "Afiliado criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar afiliado", description: error.message, variant: "destructive" });
    },
  });

  // Update affiliate mutation
  const updateAffiliateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAffiliate) return;
      const { error } = await supabase
        .from("affiliates")
        .update({
          affiliate_code: editAffiliateCode,
          commission_percent: parseFloat(editCommissionPercent),
        })
        .eq("id", selectedAffiliate.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      setEditModalOpen(false);
      toast({ title: "Afiliado atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar afiliado", description: error.message, variant: "destructive" });
    },
  });

  // Toggle affiliate status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (affiliate: Affiliate) => {
      const { error } = await supabase
        .from("affiliates")
        .update({ is_active: !affiliate.is_active })
        .eq("id", affiliate.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  // Create payout mutation
  const createPayoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAffiliate) return;
      
      const amountCents = Math.round(parseFloat(paymentAmount) * 100);
      
      const { error } = await supabase.from("affiliate_payouts").insert({
        affiliate_id: selectedAffiliate.id,
        amount_cents: amountCents,
        payment_method: paymentMethod || null,
        payment_reference: paymentReference || null,
        notes: paymentNotes || null,
        status: "paid",
        paid_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-details", selectedAffiliate?.id] });
      setPaymentModalOpen(false);
      resetPaymentForm();
      toast({ title: "Pagamento registrado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao registrar pagamento", description: error.message, variant: "destructive" });
    },
  });

  const generateAffiliateCode = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_affiliate_code");
    if (error) throw error;
    return data as string;
  };

  const resetCreateForm = () => {
    setNewAffiliateUserId("");
    setNewAffiliateCode("");
    setNewCommissionPercent("10");
  };

  const resetPaymentForm = () => {
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentReference("");
    setPaymentNotes("");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const openEditModal = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setEditAffiliateCode(affiliate.affiliate_code);
    setEditCommissionPercent(affiliate.commission_percent.toString());
    setEditModalOpen(true);
  };

  const openDetailsModal = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setDetailsModalOpen(true);
  };

  const openPaymentModal = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    // Calculate pending amount
    const paidPayouts = allPayouts
      .filter((p) => p.affiliate_id === affiliate.id && p.status === "paid")
      .reduce((sum, p) => sum + p.amount_cents, 0);
    const pending = affiliate.total_earnings_cents - paidPayouts;
    setPaymentAmount((pending / 100).toFixed(2));
    setPaymentModalOpen(true);
  };

  // Calculate stats
  const totalAffiliates = affiliates.filter((a) => a.is_active).length;
  const totalEarnings = affiliates.reduce((sum, a) => sum + a.total_earnings_cents, 0);
  const totalSales = affiliates.reduce((sum, a) => sum + a.total_sales, 0);
  const paidPayouts = allPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const pendingPayouts = totalEarnings - paidPayouts;

  // Filter affiliates
  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      !search ||
      affiliate.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.affiliate_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && affiliate.is_active) ||
      (statusFilter === "inactive" && !affiliate.is_active);

    return matchesSearch && matchesStatus;
  });

  const getAffiliateLink = (code: string) => {
    return `${window.location.origin}?ref=${code}`;
  };

  // Calculate pending for specific affiliate
  const getAffiliatePending = (affiliate: Affiliate) => {
    const paidForAffiliate = allPayouts
      .filter((p) => p.affiliate_id === affiliate.id && p.status === "paid")
      .reduce((sum, p) => sum + p.amount_cents, 0);
    return affiliate.total_earnings_cents - paidForAffiliate;
  };

  return (
    <AdminLayout title="Afiliados" description="Gerencie seu programa de afiliados">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afiliados Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAffiliates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Geradas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas por Afiliados</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidPayouts)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingPayouts)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar afiliado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Afiliado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card>
        <CardContent className="p-0">
          {loadingAffiliates ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAffiliates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Link2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum afiliado encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {search || statusFilter !== "all"
                  ? "Nenhum afiliado corresponde aos filtros aplicados."
                  : "Comece cadastrando seu primeiro afiliado para expandir suas vendas."}
              </p>
              {!search && statusFilter === "all" && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Afiliado
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-center">Comissão</TableHead>
                  <TableHead className="text-center">Vendas</TableHead>
                  <TableHead className="text-right">Ganhos</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {affiliate.profile?.full_name || "Sem nome"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.profile?.email || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {affiliate.affiliate_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(affiliate.affiliate_code, "Código")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{affiliate.commission_percent}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">{affiliate.total_sales}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(affiliate.total_earnings_cents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          getAffiliatePending(affiliate) > 0 ? "text-amber-600 font-medium" : ""
                        }
                      >
                        {formatCurrency(getAffiliatePending(affiliate))}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {affiliate.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDetailsModal(affiliate)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditModal(affiliate)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openPaymentModal(affiliate)}
                          title="Registrar Pagamento"
                        >
                          <Banknote className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleStatusMutation.mutate(affiliate)}
                          title={affiliate.is_active ? "Desativar" : "Ativar"}
                        >
                          <Power
                            className={`h-4 w-4 ${
                              affiliate.is_active ? "text-red-500" : "text-green-500"
                            }`}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Affiliate Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Afiliado</DialogTitle>
            <DialogDescription>
              Cadastre um novo afiliado ao seu programa de indicações.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Usuário *</Label>
              <Select value={newAffiliateUserId} onValueChange={setNewAffiliateUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name || user.email || user.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Todos os usuários já são afiliados ou não há usuários cadastrados.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Código do Afiliado</Label>
              <Input
                placeholder="Deixe vazio para gerar automaticamente"
                value={newAffiliateCode}
                onChange={(e) => setNewAffiliateCode(e.target.value.toUpperCase())}
              />
              <p className="text-sm text-muted-foreground">
                Código único que o afiliado usará para indicações.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comissão (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={newCommissionPercent}
                onChange={(e) => setNewCommissionPercent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createAffiliateMutation.mutate()}
              disabled={!newAffiliateUserId || createAffiliateMutation.isPending}
            >
              {createAffiliateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Criar Afiliado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Affiliate Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Afiliado</DialogTitle>
          </DialogHeader>
          {selectedAffiliate && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">
                    {selectedAffiliate.profile?.full_name || "Sem nome"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedAffiliate.profile?.email || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Comissão</Label>
                  <p className="font-medium">{selectedAffiliate.commission_percent}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>
                    {selectedAffiliate.is_active ? (
                      <Badge className="bg-green-500/10 text-green-600">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Affiliate Link */}
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-muted-foreground">Link de Afiliado</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-background rounded text-sm truncate">
                    {getAffiliateLink(selectedAffiliate.affiliate_code)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        getAffiliateLink(selectedAffiliate.affiliate_code),
                        "Link"
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total de Vendas</p>
                    <p className="text-2xl font-bold">{selectedAffiliate.total_sales}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Ganhos Totais</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedAffiliate.total_earnings_cents)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Pendente</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(getAffiliatePending(selectedAffiliate))}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales History */}
              <div>
                <h4 className="font-semibold mb-2">Histórico de Vendas</h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : affiliateDetails?.orders.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">Nenhuma venda realizada.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Comissão</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {affiliateDetails?.orders.slice(0, 5).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell>{order.course?.title || "—"}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(order.amount_cents)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(order.affiliate_commission_cents || 0)}
                            </TableCell>
                            <TableCell className="text-center">
                              {order.status === "paid" ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div>
                <h4 className="font-semibold mb-2">Histórico de Pagamentos</h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : affiliateDetails?.payouts.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">Nenhum pagamento registrado.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {affiliateDetails?.payouts.map((payout) => (
                          <TableRow key={payout.id}>
                            <TableCell>
                              {format(new Date(payout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell>{payout.payment_method || "—"}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(payout.amount_cents)}
                            </TableCell>
                            <TableCell className="text-center">
                              {payout.status === "paid" ? (
                                <Badge className="bg-green-500/10 text-green-600">Pago</Badge>
                              ) : payout.status === "cancelled" ? (
                                <Badge variant="destructive">Cancelado</Badge>
                              ) : (
                                <Badge variant="secondary">Pendente</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Affiliate Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Afiliado</DialogTitle>
            <DialogDescription>
              Atualize as informações do afiliado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código do Afiliado</Label>
              <Input
                value={editAffiliateCode}
                onChange={(e) => setEditAffiliateCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label>Comissão (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={editCommissionPercent}
                onChange={(e) => setEditCommissionPercent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => updateAffiliateMutation.mutate()}
              disabled={updateAffiliateMutation.isPending}
            >
              {updateAffiliateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre um pagamento de comissão para{" "}
              {selectedAffiliate?.profile?.full_name || "o afiliado"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              {selectedAffiliate && (
                <p className="text-sm text-muted-foreground">
                  Saldo pendente: {formatCurrency(getAffiliatePending(selectedAffiliate))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referência do Pagamento</Label>
              <Input
                placeholder="ID da transação, comprovante, etc."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Notas adicionais sobre o pagamento..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createPayoutMutation.mutate()}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || createPayoutMutation.isPending}
            >
              {createPayoutMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Registrar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
