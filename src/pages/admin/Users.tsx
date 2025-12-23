import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function AdminUsers() {
  return (
    <AdminLayout title="Usuários" description="Gerencie usuários e permissões">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <UserCog className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground max-w-md">
            Aqui você poderá gerenciar usuários administrativos,
            definir roles e permissões de acesso ao painel.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
