import { useMemo } from "react";
import { differenceInDays, addDays, isPast, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Module {
  id: string;
  title: string;
  drip_days: number | null;
  sort_order: number;
}

interface DripStatus {
  isAvailable: boolean;
  availableDate: Date | null;
  daysUntilAvailable: number;
  formattedMessage: string;
}

export function useDripContent(enrolledAt: string | Date) {
  const enrollmentDate = useMemo(() => new Date(enrolledAt), [enrolledAt]);

  const getModuleDripStatus = (module: Module): DripStatus => {
    const dripDays = module.drip_days || 0;
    
    if (dripDays === 0) {
      return {
        isAvailable: true,
        availableDate: null,
        daysUntilAvailable: 0,
        formattedMessage: "",
      };
    }

    const availableDate = addDays(enrollmentDate, dripDays);
    const isAvailable = isPast(availableDate);
    const daysUntilAvailable = isAvailable ? 0 : differenceInDays(availableDate, new Date()) + 1;

    const formattedMessage = isAvailable 
      ? "" 
      : `Disponível ${formatDistanceToNow(availableDate, { addSuffix: true, locale: ptBR })}`;

    return {
      isAvailable,
      availableDate,
      daysUntilAvailable,
      formattedMessage,
    };
  };

  const checkModuleAvailability = (modules: Module[]): Map<string, DripStatus> => {
    const statusMap = new Map<string, DripStatus>();
    
    modules.forEach(module => {
      statusMap.set(module.id, getModuleDripStatus(module));
    });

    return statusMap;
  };

  return {
    getModuleDripStatus,
    checkModuleAvailability,
    enrollmentDate,
  };
}
