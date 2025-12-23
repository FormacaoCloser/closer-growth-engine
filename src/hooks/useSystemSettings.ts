import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  category: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

interface UpdateSettingParams {
  key: string;
  value: string;
}

export function useSystemSettings(category?: string) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["system-settings", category],
    queryFn: async () => {
      let query = supabase
        .from("system_settings")
        .select("*")
        .order("setting_key");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: UpdateSettingParams) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("system_settings")
        .update({ 
          setting_value: value,
          updated_by: userData.user?.id 
        })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMultipleSettings = useMutation({
    mutationFn: async (updates: UpdateSettingParams[]) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const promises = updates.map(({ key, value }) =>
        supabase
          .from("system_settings")
          .update({ 
            setting_value: value,
            updated_by: userData.user?.id 
          })
          .eq("setting_key", key)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      
      if (errors.length > 0) {
        throw new Error("Erro ao salvar algumas configurações");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getValue = (key: string): string => {
    const setting = settings?.find((s) => s.setting_key === key);
    return setting?.setting_value ?? "";
  };

  const getBooleanValue = (key: string): boolean => {
    const value = getValue(key);
    return value === "true";
  };

  const getNumberValue = (key: string): number => {
    const value = getValue(key);
    return value ? parseFloat(value) : 0;
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    updateMultipleSettings,
    getValue,
    getBooleanValue,
    getNumberValue,
  };
}
