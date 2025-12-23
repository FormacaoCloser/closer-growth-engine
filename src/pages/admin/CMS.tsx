import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCMSContent } from "@/hooks/useCMSContent";
import { HeroEditor } from "@/components/admin/cms/HeroEditor";
import { BenefitsEditor } from "@/components/admin/cms/BenefitsEditor";
import { FAQEditor } from "@/components/admin/cms/FAQEditor";
import { InstructorEditor } from "@/components/admin/cms/InstructorEditor";
import { JourneyEditor } from "@/components/admin/cms/JourneyEditor";
import { CTAEditor } from "@/components/admin/cms/CTAEditor";
import { Home, Star, HelpCircle, User, MapPin, MousePointerClick, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCMS() {
  const { data: content, isLoading } = useCMSContent('landing');

  return (
    <AdminLayout title="CMS" description="Gerencie o conteúdo da landing page">
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Landing Page
          </a>
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="hero" className="flex items-center gap-2 py-3">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2 py-3">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Benefícios</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2 py-3">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="instructor" className="flex items-center gap-2 py-3">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Instrutor</span>
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2 py-3">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Jornada</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center gap-2 py-3">
            <MousePointerClick className="h-4 w-4" />
            <span className="hidden sm:inline">CTAs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroEditor content={content} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitsEditor content={content} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="faq">
          <FAQEditor content={content} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="instructor">
          <InstructorEditor content={content} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="journey">
          <JourneyEditor content={content} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="cta">
          <CTAEditor content={content} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
