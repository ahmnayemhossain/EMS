import { CalendarDays, ClipboardCheck, ShieldCheck } from "lucide-react";

import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";

export function AuditsKpis({
  total,
  inProgress,
  criticalFindings,
  companyCount,
}: {
  total: number;
  inProgress: number;
  criticalFindings: number;
  companyCount: number;
}) {
  return (
    <PageKpiGrid columnsClassName="sm:grid-cols-2 xl:grid-cols-4">
      <KPIStatCard title="Audits" value={total} icon={ShieldCheck} tone="info" />
      <KPIStatCard
        title="In progress"
        value={inProgress}
        icon={ClipboardCheck}
        tone={inProgress > 0 ? "warning" : "compliant"}
      />
      <KPIStatCard
        title="Critical findings"
        value={criticalFindings}
        helper="Across audits"
        tone={criticalFindings > 0 ? "critical" : "compliant"}
      />
      <KPIStatCard title="Companies" value={companyCount} icon={CalendarDays} tone="neutral" />
    </PageKpiGrid>
  );
}


