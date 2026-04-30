import * as React from "react";
import { toast } from "@/core/app/lib/toast";

import { listUtilityRecords, listUtilitySourceOptions, listUtilityUomOptions } from "@/features/UtilitiesPage/api";
import type { UtilityRecord, UtilitySourceOption, UtilityUomOption } from "@/core/types/ems";

export function useUtilitiesLoader(userId: string) {
  const [utilityRows, setUtilityRows] = React.useState<UtilityRecord[]>([]);
  const [uomOptions, setUomOptions] = React.useState<UtilityUomOption[]>([]);
  const [sourceOptions, setSourceOptions] = React.useState<UtilitySourceOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadUtilities() {
      setLoading(true);
      try {
        const [records, uoms, sources] = await Promise.all([listUtilityRecords(userId), listUtilityUomOptions(userId), listUtilitySourceOptions(userId)]);
        if (!cancelled) { setUtilityRows(records); setUomOptions(uoms); setSourceOptions(sources); }
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Failed to load utility records.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUtilities();
    return () => { cancelled = true; };
  }, [userId]);

  return { utilityRows, setUtilityRows, uomOptions, sourceOptions, loading };
}
