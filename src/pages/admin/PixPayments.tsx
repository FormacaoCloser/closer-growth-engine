import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Search,
  Filter,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

type PaymentStatus = "pending" | "approved" | "rejected";

const statusConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
};

export default function AdminPixPayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch manual Pix payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-pix-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_pix_payments")
        .select(`
          *,
          course:courses(id, title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const pending = payments.filter((p) => p.status === "pending");
    const approvedRecent = payments.filter(
      (p) => p.status === "approved" && p.verified_at && parseISO(p.verified_at) >= thirtyDaysAgo
    );
    const rejectedRecent = payments.filter(
      (p) => p.status === "rejected" && p.verified_at && parseISO(p.verified_at) >= thirtyDaysAgo
    );
    const pendingTotal = pending.reduce((sum, p) => sum + (p.amount_cents || 0), 0);

    return {
      pendingCount: pending.length,
      approvedCount: approvedRecent.length,
      rejectedCount: rejectedRecent.length,
      pendingTotal,
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        search === "" ||
        payment.name?.toLowerCase().includes(search.toLowerCase()) ||
        payment.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // Approve payment mutation
  const approveMutation = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) throw new Error("Pagamento não encontrado");

      // 1. Update the payment status
      const { error: updateError } = await supabase
        .from("manual_pix_payments")
        .update({
          status: "approved",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", paymentId);

      if (updateError) throw updateError;

      // 2. Find or create profile for this email
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", payment.email)
        .single();

      let userId = existingProfile?.user_id;

      // If no profile exists, we'll create a placeholder
      // Note: This requires the user to sign up later
      if (!userId) {
        // We can't create auth users from client side without service role
        // So we'll skip enrollment creation for now and notify admin
        toast.warning("Usuário não cadastrado. A matrícula será criada quando o aluno se cadastrar.");
        return { enrollmentCreated: false };
      }

      // 3. Create enrollment if we have user_id and course_id
      if (payment.course_id) {
        // Check if enrollment already exists
        const { data: existingEnrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", userId)
          .eq("course_id", payment.course_id)
          .single();

        if (!existingEnrollment) {
          const { error: enrollError } = await supabase
            .from("enrollments")
            .insert({
              user_id: userId,
              course_id: payment.course_id,
              status: "active",
            });

          if (enrollError) throw enrollError;
        }
      }

      return { enrollmentCreated: true };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pix-payments"] });
      if (result.enrollmentCreated) {
        toast.success("Pagamento aprovado e matrícula criada com sucesso!");
      } else {
        toast.success("Pagamento aprovado!");
      }
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao aprovar pagamento: " + (error as Error).message);
    },
  });

  // Reject payment mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      if (!notes.trim()) throw new Error("Motivo da rejeição é obrigatório");

      const { error } = await supabase
        .from("manual_pix_payments")
        .update({
          status: "rejected",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          notes: notes,
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pix-payments"] });
      toast.success("Pagamento rejeitado.");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao rejeitar pagamento: " + (error as Error).message);
    },
  });

  const openDialog = (payment: any, action: "approve" | "reject") => {
    setSelectedPayment(payment);
    setActionType(action);
    setNotes("");
  };

  const closeDialog = () => {
    setSelectedPayment(null);
    setActionType(null);
    setNotes("");
  };

  const handleConfirm = () => {
    if (!selectedPayment) return;

    if (actionType === "approve") {
      approveMutation.mutate({ paymentId: selectedPayment.id, notes });
    } else if (actionType === "reject") {
      rejectMutation.mutate({ paymentId: selectedPayment.id, notes });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <AdminLayout title="Pix Pendentes" description="Gerencie e aprove pagamentos Pix manuais">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados (30d)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.approvedCount}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados (30d)</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.pendingTotal)}</div>
            <p className="text-xs text-muted-foreground">Total a aprovar</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Pagamentos Pix</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <QrCode className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground max-w-md">
                {search || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Quando você receber um pagamento Pix manual, ele aparecerá aqui."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const status = (payment.status as PaymentStatus) || "pending";

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(payment.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.name || "—"}</div>
                          <div className="text-sm text-muted-foreground">{payment.email}</div>
                          {payment.phone && (
                            <div className="text-sm text-muted-foreground">{payment.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.course?.title || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount_cents)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[status]?.variant || "secondary"}>
                          {statusConfig[status]?.label || status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === "pending" ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openDialog(payment, "approve")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDialog(payment, "reject")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {payment.verified_at &&
                              format(parseISO(payment.verified_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedPayment && !!actionType} onOpenChange={() => closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Aprovar Pagamento" : "Rejeitar Pagamento"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" ? (
                <>
                  Confirma a aprovação do pagamento de{" "}
                  <strong>{formatCurrency(selectedPayment?.amount_cents || 0)}</strong> para{" "}
                  <strong>{selectedPayment?.name}</strong>?
                  {selectedPayment?.course?.title && (
                    <>
                      <br />
                      <br />
                      Uma matrícula será criada para o curso{" "}
                      <strong>{selectedPayment.course.title}</strong>.
                    </>
                  )}
                </>
              ) : (
                <>
                  Rejeitar o pagamento de <strong>{selectedPayment?.name}</strong>? Informe o motivo
                  da rejeição abaixo.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="notes">
              {actionType === "approve" ? "Notas (opcional)" : "Motivo da rejeição"}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                actionType === "approve"
                  ? "Adicione observações se necessário..."
                  : "Informe o motivo da rejeição..."
              }
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isProcessing || (actionType === "reject" && !notes.trim())}
              className={actionType === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : actionType === "approve" ? (
                "Confirmar Aprovação"
              ) : (
                "Confirmar Rejeição"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
