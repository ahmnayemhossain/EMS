import { CalendarDays, ClipboardCheck, ShieldCheck } from "lucide-react";

import { facilities } from "@/data/mock";
import { KPIStatCard } from "@/components/KPIStatCard";
import { PageKpiGrid } from "@/components/PageKpiGrid";

export function AuditsKpis({
  total,
  inProgress,
  criticalFindings,
}: {
  total: number;
  inProgress: number;
  criticalFindings: number;
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
      <KPIStatCard title="Companies" value={facilities.length} icon={CalendarDays} tone="neutral" />
    </PageKpiGrid>
  );
}

