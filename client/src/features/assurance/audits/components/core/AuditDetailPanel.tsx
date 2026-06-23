import { Separator } from "@/components/ui/primitives/separator";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { AuditRecord } from "@/core/types/models/audit";

import { formatAuditDate } from "../../config/audit.helpers";
import { AuditDetailActions } from "../detail/AuditDetailActions";
import { AuditFindingsCard } from "../detail/AuditFindingsCard";

export function AuditDetailPanel({
  audit,
  onClose,
}: {
  audit: AuditRecord | null;
  onClose: () => void;
}) {
  return (
    <DetailPanel
      open={Boolean(audit)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={audit ? audit.name : "Audit"}
      description={
        audit
          ? `${audit.companyName || audit.facilityId}${audit.customerName ? ` • ${audit.customerName}` : ""} • ${formatAuditDate(audit.date)}`
          : undefined
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
            {audit.nextAuditDate ? (
              <StatusBadge tone="neutral">Next {formatAuditDate(audit.nextAuditDate)}</StatusBadge>
            ) : null}
            <StatusBadge tone="neutral">
              Findings {audit.findingsCount.minor + audit.findingsCount.major + audit.findingsCount.critical}
            </StatusBadge>
          </div>
          <AuditFindingsCard audit={audit} />
          <AuditDetailActions audit={audit} />
          <Separator />
          <div className="text-xs text-muted-foreground">
            Auditor: {audit.auditor}
          </div>
        </div>
      ) : null}
    </DetailPanel>
  );
}
