import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";
import { formatNumber } from "@/core/utils/format";

export function UtilitiesKpis({
  recordsCount,
  total,
  highVarianceCount,
  missingBillsCount,
  readyToSubmitCount,
  readyForApprovalCount,
}: {
  recordsCount: number;
  total: number;
  highVarianceCount: number;
  missingBillsCount: number;
  readyToSubmitCount: number;
  readyForApprovalCount: number;
}) {
  return (
    <PageKpiGrid columnsClassName="sm:grid-cols-2 xl:grid-cols-4">
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
      <KPIStatCard
        title="Ready to submit"
        value={readyToSubmitCount}
        helper="Full month complete"
        tone={readyToSubmitCount > 0 ? "info" : "neutral"}
      />
      <KPIStatCard
        title="Ready for approval"
        value={readyForApprovalCount}
        helper="Active approval months"
        tone={readyForApprovalCount > 0 ? "warning" : "neutral"}
      />
    </PageKpiGrid>
  );
}

