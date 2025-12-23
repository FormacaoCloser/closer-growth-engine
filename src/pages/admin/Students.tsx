import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminStudents() {
  return (
    <AdminLayout title="Alunos" description="Gerencie os alunos matriculados">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground max-w-md">
            Aqui você poderá visualizar todos os alunos matriculados, 
            acompanhar o progresso de cada um e gerenciar matrículas.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
