import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  UserPlus,
  Mail
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminDashboard() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const today = startOfDay(now);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Total revenue (all time)
      const { data: totalRevenueData } = await supabase
        .from("orders")
        .select("amount_cents")
        .eq("status", "paid");
      const totalRevenue = totalRevenueData?.reduce((sum, o) => sum + o.amount_cents, 0) || 0;

      // Revenue this month
      const { data: currentMonthRevenue } = await supabase
        .from("orders")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("paid_at", startOfCurrentMonth.toISOString());
      const revenueThisMonth = currentMonthRevenue?.reduce((sum, o) => sum + o.amount_cents, 0) || 0;

      // Revenue last month
      const { data: lastMonthRevenue } = await supabase
        .from("orders")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("paid_at", startOfLastMonth.toISOString())
        .lt("paid_at", startOfCurrentMonth.toISOString());
      const revenueLastMonth = lastMonthRevenue?.reduce((sum, o) => sum + o.amount_cents, 0) || 0;

      // Revenue growth %
      const revenueGrowth = revenueLastMonth > 0 
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
        : revenueThisMonth > 0 ? 100 : 0;

      // Total students
      const { count: totalStudents } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // New students this month
      const { count: newStudentsThisMonth } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .gte("enrolled_at", startOfCurrentMonth.toISOString());

      // Total leads
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      // Paid orders count
      const { count: paidOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid");

      // Conversion rate
      const conversionRate = totalLeads && totalLeads > 0 
        ? ((paidOrders || 0) / totalLeads) * 100 
        : 0;

      // Leads today
      const { count: leadsToday } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      return {
        totalRevenue,
        revenueGrowth,
        totalStudents: totalStudents || 0,
        newStudentsThisMonth: newStudentsThisMonth || 0,
        conversionRate,
        leadsToday: leadsToday || 0,
      };
    },
  });

  // Fetch recent sales
  const { data: recentSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["dashboard-recent-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, amount_cents, paid_at, user_id, course:courses(title)")
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Fetch profiles for user names
      if (data && data.length > 0) {
        const userIds = data.map(o => o.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);
        
        return data.map(order => ({
          ...order,
          profile: profiles?.find(p => p.user_id === order.user_id),
        }));
      }
      
      return data || [];
    },
  });

  // Fetch recent leads
  const { data: recentLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["dashboard-recent-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, email, created_at, utm_source")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <AdminLayout title="Dashboard" description="Visão geral do seu negócio">
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
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stats?.revenueGrowth && stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {stats?.revenueGrowth && stats.revenueGrowth >= 0 ? "+" : ""}
                    {(stats?.revenueGrowth || 0).toFixed(0)}%
                  </span>{" "}
                  vs mês anterior
                </p>
              </>
            )}
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
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">+{stats?.newStudentsThisMonth || 0}</span>{" "}
                  novos este mês
                </p>
              </>
            )}
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
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(stats?.conversionRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  leads → vendas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Hoje
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.leadsToday || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  capturados hoje
                </p>
              </>
            )}
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
            {salesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sale.profile?.full_name || sale.profile?.email || "Cliente"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {sale.course?.title || "Curso"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(sale.amount_cents)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.paid_at ? formatDate(sale.paid_at) : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma venda registrada ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
            <CardDescription>Últimos leads capturados</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {lead.name || "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </p>
                      {lead.utm_source && (
                        <p className="text-xs text-blue-500">
                          {lead.utm_source}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Nenhum lead capturado ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
