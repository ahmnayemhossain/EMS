import { KPIStatCard } from "@/components/KPIStatCard";
import { PageKpiGrid } from "@/components/PageKpiGrid";
import { formatNumber } from "@/utils/format";

export function UtilitiesKpis({
  recordsCount,
  total,
  highVarianceCount,
  missingBillsCount,
}: {
  recordsCount: number;
  total: number;
  highVarianceCount: number;
  missingBillsCount: number;
}) {
  return (
    <PageKpiGrid columnsClassName="sm:grid-cols-2 xl:grid-cols-3">
      <KPIStatCard title="Records" value={recordsCount} tone="neutral" />
      <KPIStatCard
        title="Total"
        value={formatNumber(total)}
        helper="Sum of selected records"
        tone="info"
      />
      <KPIStatCard
        title="High variance"
        value={highVarianceCount}
        helper="Requires review"
        tone={highVarianceCount > 0 ? "warning" : "compliant"}
      />
      <KPIStatCard
        title="Missing bills"
        value={missingBillsCount}
        helper="Attach bill files"
        tone={missingBillsCount > 0 ? "warning" : "compliant"}
      />
    </PageKpiGrid>
  );
}
