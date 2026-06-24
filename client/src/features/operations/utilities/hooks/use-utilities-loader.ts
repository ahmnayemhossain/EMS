import * as React from "react";
import { toast } from "@/core/app/lib/toast";

import { listUtilityRecords, listUtilitySourceOptions, listUtilityUomOptions } from "@/features/operations/utilities/services/api";
import type { UtilityRecord, UtilitySourceOption, UtilityUomOption } from "@/core/types/models/ems";

export function useUtilitiesLoader(userId: string, input?: { facilityId?: string }) {
  const [utilityRows, setUtilityRows] = React.useState<UtilityRecord[]>([]);
  const [uomOptions, setUomOptions] = React.useState<UtilityUomOption[]>([]);
  const [sourceOptions, setSourceOptions] = React.useState<UtilitySourceOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadUtilities = React.useCallback(async () => {
    setLoading(true);
    try {
      const [records, uoms, sources] = await Promise.all([
        listUtilityRecords(userId, { facilityId: input?.facilityId }),
        listUtilityUomOptions(userId),
        listUtilitySourceOptions(userId),
      ]);
      setUtilityRows(records);
      setUomOptions(uoms);
      setSourceOptions(sources);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load utility records.");
    } finally {
      setLoading(false);
    }
  }, [input?.facilityId, userId]);

  React.useEffect(() => {
    void loadUtilities().catch(() => undefined);
  }, [loadUtilities]);

  return { utilityRows, setUtilityRows, uomOptions, sourceOptions, loading, reloadUtilities: loadUtilities };
}
