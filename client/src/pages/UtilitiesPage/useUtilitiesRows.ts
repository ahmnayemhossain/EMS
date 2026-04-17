import { getFacilityName, utilityRecords } from "@/data/mock";
import type { UtilityRecord, UtilityType } from "@/types/ems";

export function useUtilitiesRows({
  active,
  facilityId,
  search,
}: {
  active: UtilityType;
  facilityId?: string;
  search: string;
}) {
  const rows: UtilityRecord[] = utilityRecords
    .filter((r) => r.type === active)
    .filter((r) => (facilityId ? r.facilityId === facilityId : true))
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.meterName.toLowerCase().includes(q) ||
        getFacilityName(r.facilityId).toLowerCase().includes(q)
      );
    });

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const highVarianceCount = rows.filter((r) => r.varianceFlag === "high").length;
  const missingBillsCount = rows.filter((r) => !(r.billFiles?.length)).length;

  return { rows, total, highVarianceCount, missingBillsCount };
}

