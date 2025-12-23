import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <AdminLayout title="Configurações" description="Configure seu sistema">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Settings className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground max-w-md">
            Aqui você poderá configurar integrações (Stripe, emails, analytics),
            personalizar o domínio e ajustar preferências do sistema.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
