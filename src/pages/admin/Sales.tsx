import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function AdminSales() {
  return (
    <AdminLayout title="Vendas" description="Acompanhe suas vendas e receitas">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground max-w-md">
            Aqui você poderá visualizar todas as vendas realizadas,
            gerar relatórios financeiros e acompanhar métricas de conversão.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
