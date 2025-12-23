import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AdminCMS() {
  return (
    <AdminLayout title="CMS" description="Gerencie o conteúdo do site">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em breve</h3>
          <p className="text-muted-foreground max-w-md">
            Aqui você poderá editar textos, imagens e vídeos da página de vendas,
            além de gerenciar depoimentos e FAQ.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
