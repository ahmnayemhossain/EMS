import { Link } from "react-router";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/primitives/button";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { getCompanyName } from "@/core/companies/directory";
import type { ScheduledAudit } from "@/features/overview/audit-calendar/config/types";

export function AuditDetailContent({ audits }: { audits: ScheduledAudit[] }) {
  return (
    <div className="space-y-4">
      {audits.map((audit) => <AuditDetailCard key={audit.id} audit={audit} />)}
      <Button asChild variant="outline" className="w-full">
        <Link to="/audits">Open audits module</Link>
      </Button>
    </div>
  );
}

function AuditDetailCard({ audit }: { audit: ScheduledAudit }) {
  const { companies } = useSelectedCompany();
  const companyName = audit.companyName || getCompanyName(audit.facilityId, companies);

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{audit.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">{companyName} • {audit.auditor}</div>
        </div>
        <StatusBadge tone={audit.progress >= 75 ? "compliant" : audit.progress > 0 ? "warning" : "neutral"}>{audit.progress}%</StatusBadge>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <MetricCard label="Score">
          <StatusBadge tone={audit.overallScore >= 85 ? "compliant" : audit.overallScore >= 70 ? "warning" : audit.overallScore > 0 ? "critical" : "neutral"}>
            {audit.overallScore ? `${audit.overallScore}%` : "—"}
          </StatusBadge>
        </MetricCard>
        <MetricCard label="Findings">
          <div className="mt-1 flex flex-wrap gap-1">
            <StatusBadge tone="neutral">{audit.findingsCount.minor}</StatusBadge>
            <StatusBadge tone="warning">{audit.findingsCount.major}</StatusBadge>
            <StatusBadge tone="critical">{audit.findingsCount.critical}</StatusBadge>
          </div>
        </MetricCard>
      </div>
    </div>
  );
}

function MetricCard(props: { label: string; children: React.ReactNode }) {
  return <div className="rounded-lg border p-2"><div className="text-muted-foreground text-[11px]">{props.label}</div><div className="mt-1">{props.children}</div></div>;
}
