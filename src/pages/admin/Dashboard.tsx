import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye
} from "lucide-react";

export default function AdminDashboard() {
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
    </AdminLayout>
  );
}
