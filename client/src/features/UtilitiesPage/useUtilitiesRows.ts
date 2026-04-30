import type { CompanyOption } from "@/core/app/state/company";
import type { UtilityRecord, UtilityType } from "@/core/types/ems";

export function useUtilitiesRows({
  active,
  facilityId,
  search,
  extraRows = [],
  companies = [],
}: {
  active: UtilityType;
  facilityId?: string;
  search: string;
  extraRows?: UtilityRecord[];
  companies?: CompanyOption[];
}) {
  const companyNameById = new Map(companies.map((company) => [company.id, company.name.toLowerCase()]));
  const rows: UtilityRecord[] = [...extraRows]
    .filter((r) => r.type === active)
    .filter((r) => (facilityId ? r.facilityId === facilityId : true))
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.meterName.toLowerCase().includes(q) ||
        (companyNameById.get(r.facilityId) || "").includes(q)
      );
    });

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const highVarianceCount = rows.filter((r) => r.varianceFlag === "high").length;
  const missingBillsCount = rows.filter((r) => !(r.billFiles?.length)).length;

  return { rows, total, highVarianceCount, missingBillsCount };
}
