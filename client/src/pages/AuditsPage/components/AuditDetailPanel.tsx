import { toast } from "sonner";
import { useNavigate } from "react-router";

import { getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { DetailPanel } from "@/components/DetailPanel";
import { StatusBadge } from "@/components/StatusBadge";
import type { AuditRecord } from "@/types/audit";
import { formatAuditDate } from "../audit.helpers";

export function AuditDetailPanel({
  audit,
  onClose,
}: {
  audit: AuditRecord | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <DetailPanel
      open={Boolean(audit)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={audit ? audit.name : "Audit"}
      description={
        audit ? `${getFacilityName(audit.facilityId)} • ${formatAuditDate(audit.date)}` : undefined
      }
    >
      {audit ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="neutral">Progress {audit.progress}%</StatusBadge>
            <StatusBadge
              tone={
                audit.overallScore >= 85
                  ? "compliant"
                  : audit.overallScore >= 70
                    ? "warning"
                    : "critical"
              }
            >
              Score {audit.overallScore}%
            </StatusBadge>
            <StatusBadge tone="neutral">
              Findings {audit.findingsCount.minor + audit.findingsCount.major + audit.findingsCount.critical}
            </StatusBadge>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">Findings (latest)</div>
              <div className="flex flex-wrap justify-end gap-2">
                <StatusBadge tone="neutral">Minor {audit.findingsCount.minor}</StatusBadge>
                <StatusBadge tone="warning">Major {audit.findingsCount.major}</StatusBadge>
                <StatusBadge tone="critical">Critical {audit.findingsCount.critical}</StatusBadge>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {audit.findings.slice(0, 6).map((f) => (
                <div key={f.id} className="rounded-md border p-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{f.title}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {f.area} • {f.status}
                        {f.owner ? ` • ${f.owner}` : ""}
                      </div>
                    </div>
                    <StatusBadge
                      tone={
                        f.severity === "critical"
                          ? "critical"
                          : f.severity === "major"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {f.severity}
                    </StatusBadge>
                  </div>
                </div>
              ))}
              {!audit.findings.length ? (
                <div className="text-muted-foreground text-sm">No findings recorded.</div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/audit-calendar")}>
              Open audit calendar
            </Button>
            {audit.findingsCount.critical + audit.findingsCount.major > 0 ? (
              <Button variant="outline" onClick={() => navigate("/capa")}>
                Open CAPA
              </Button>
            ) : null}
            <Button onClick={() => toast.message("Audit detail view (next step)")}>Open details</Button>
          </div>

          <Separator />
          <div className="text-muted-foreground text-xs">
            Templates can be refined to match your exact certificate requirements.
          </div>
        </div>
      ) : null}
    </DetailPanel>
  );
}

