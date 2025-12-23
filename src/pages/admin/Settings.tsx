import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CreditCard, Mail, Users, Shield } from "lucide-react";
import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { PaymentSettingsTab } from "@/components/admin/settings/PaymentSettingsTab";
import { EmailSettingsTab } from "@/components/admin/settings/EmailSettingsTab";
import { AffiliateSettingsTab } from "@/components/admin/settings/AffiliateSettingsTab";
import { SecuritySettingsTab } from "@/components/admin/settings/SecuritySettingsTab";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <AdminLayout title="Configurações" description="Configure seu sistema">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:inline" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4 hidden sm:inline" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4 hidden sm:inline" />
            <span>Emails</span>
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="gap-2">
            <Users className="h-4 w-4 hidden sm:inline" />
            <span>Afiliados</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:inline" />
            <span>Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentSettingsTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailSettingsTab />
        </TabsContent>

        <TabsContent value="affiliate">
          <AffiliateSettingsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
