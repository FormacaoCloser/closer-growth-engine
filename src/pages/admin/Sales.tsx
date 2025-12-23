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
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Clock,
  ShoppingBag,
  Search,
  Filter,
  Users,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

type OrderStatus = "pending" | "paid" | "failed" | "refunded";

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  failed: { label: "Falhou", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "outline" },
};

const periodOptions = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Último ano" },
];

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminSales() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [period, setPeriod] = useState("30");

  const startDate = useMemo(() => startOfDay(subDays(new Date(), parseInt(period))), [period]);
  const endDate = useMemo(() => endOfDay(new Date()), []);

  // Fetch orders with course and affiliate details
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          course:courses(title),
          affiliate:affiliates(affiliate_code)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch leads for conversion calculation
  const { data: leads = [] } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, created_at, converted_at");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch abandoned carts
  const { data: abandonedCarts = [] } = useQuery({
    queryKey: ["admin-abandoned-carts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("recovered", false);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch affiliates for top affiliates widget
  const { data: affiliates = [] } = useQuery({
    queryKey: ["admin-affiliates-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("total_sales", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch profiles for customer names
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "paid");
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount_cents || 0), 0);
    const totalSales = paidOrders.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const conversionRate = leads.length > 0 ? (totalSales / leads.length) * 100 : 0;

    return {
      totalRevenue,
      totalSales,
      avgTicket,
      conversionRate,
      pendingOrders: pendingOrders.length,
      abandonedCarts: abandonedCarts.length,
    };
  }, [orders, leads, abandonedCarts]);

  // Calculate chart data for period
  const chartData = useMemo(() => {
    const days = parseInt(period);
    const data: { date: string; revenue: number; label: string }[] = [];

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOrders = orders.filter(
        (o) =>
          o.status === "paid" &&
          o.paid_at &&
          format(parseISO(o.paid_at), "yyyy-MM-dd") === dateStr
      );
      const revenue = dayOrders.reduce((sum, o) => sum + (o.amount_cents || 0), 0) / 100;

      data.push({
        date: dateStr,
        revenue,
        label: format(date, "dd/MM", { locale: ptBR }),
      });
    }

    return data;
  }, [orders, period]);

  // Calculate UTM performance
  const utmPerformance = useMemo(() => {
    const utmMap = new Map<string, { sales: number; revenue: number }>();

    orders
      .filter((o) => o.status === "paid" && o.utm_source)
      .forEach((order) => {
        const key = `${order.utm_source || "direto"}`;
        const existing = utmMap.get(key) || { sales: 0, revenue: 0 };
        utmMap.set(key, {
          sales: existing.sales + 1,
          revenue: existing.revenue + (order.amount_cents || 0),
        });
      });

    return Array.from(utmMap.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  // Filter orders for table
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const profile = profiles.find((p) => p.user_id === order.user_id);
      const customerName = profile?.full_name || profile?.email || "";

      const matchesSearch =
        search === "" ||
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.course?.title?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, profiles, search, statusFilter]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <AdminLayout title="Vendas" description="Acompanhe suas vendas e receitas">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Vendas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalSales}</div>
            <p className="text-xs text-muted-foreground">Pedidos pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Leads → Vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.avgTicket)}</div>
            <p className="text-xs text-muted-foreground">Por venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandonados</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.abandonedCarts}</div>
            <p className="text-xs text-muted-foreground">Carrinhos não recuperados</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendas ao Longo do Tempo</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {chartData.every((d) => d.revenue === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhuma venda no período selecionado</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                  className="text-xs fill-muted-foreground"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value) * 100)}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Vendas Recentes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente ou curso..."
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
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground max-w-md">
                {search || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Quando você realizar sua primeira venda, ela aparecerá aqui."}
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
                  <TableHead>Origem</TableHead>
                  <TableHead>Afiliado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.slice(0, 20).map((order) => {
                  const profile = profiles.find((p) => p.user_id === order.user_id);
                  const status = (order.status as OrderStatus) || "pending";

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(order.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{profile?.full_name || "—"}</div>
                          <div className="text-sm text-muted-foreground">
                            {profile?.email || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.course?.title || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.amount_cents)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[status]?.variant || "secondary"}>
                          {statusConfig[status]?.label || status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.utm_source ? (
                          <span className="text-sm">{order.utm_source}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.affiliate?.affiliate_code ? (
                          <Badge variant="outline">{order.affiliate.affiliate_code}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
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

      {/* Bottom Widgets */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Funnel Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Leads</span>
                </div>
                <span className="font-semibold">{leads.length}</span>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Carrinhos</span>
                </div>
                <span className="font-semibold">{abandonedCarts.length + kpis.totalSales}</span>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Vendas</span>
                </div>
                <span className="font-bold text-primary">{kpis.totalSales}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de conversão</span>
                  <span className="font-semibold">{kpis.conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UTM Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {utmPerformance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Sem dados de UTM</p>
              </div>
            ) : (
              <div className="space-y-3">
                {utmPerformance.map((utm) => (
                  <div key={utm.source} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{utm.source}</div>
                      <div className="text-xs text-muted-foreground">{utm.sales} vendas</div>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(utm.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Affiliates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates.filter((a) => a.total_sales > 0).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma venda de afiliados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {affiliates
                  .filter((a) => a.total_sales > 0)
                  .map((affiliate, index) => (
                    <div key={affiliate.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <Badge variant="outline">{affiliate.affiliate_code}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(affiliate.total_earnings_cents)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {affiliate.total_sales} vendas
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
