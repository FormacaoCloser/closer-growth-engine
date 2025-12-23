import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link2 } from "lucide-react";

export default function AdminAffiliates() {
  return (
    <AdminLayout title="Afiliados" description="Gerencie seu programa de afiliados">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Link2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground max-w-md">
            Aqui você poderá cadastrar afiliados, definir comissões,
            acompanhar vendas por afiliado e gerenciar pagamentos.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
