import { Separator } from "@/components/ui/primitives/separator";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { AuditRecord } from "@/core/types/models/audit";

import { formatAuditDate } from "../../config/audit.helpers";
import { AuditDetailActions } from "../detail/AuditDetailActions";
import { AuditFindingsCard } from "../detail/AuditFindingsCard";

export function AuditDetailPanel({ audit, onClose }: { audit: AuditRecord | null; onClose: () => void; }) {
  return <DetailPanel open={Boolean(audit)} onOpenChange={(open) => { if (!open) onClose(); }} title={audit ? audit.name : "Audit"} description={audit ? `${getFacilityName(audit.facilityId)}${audit.customerName ? ` ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${audit.customerName}` : ""} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${formatAuditDate(audit.date)}` : undefined}>{audit ? <div className="space-y-4"><div className="flex flex-wrap gap-2"><StatusBadge tone="neutral">Progress {audit.progress}%</StatusBadge><StatusBadge tone={audit.overallScore >= 85 ? "compliant" : audit.overallScore >= 70 ? "warning" : "critical"}>Score {audit.overallScore}%</StatusBadge>{audit.nextAuditDate ? <StatusBadge tone="neutral">Next {formatAuditDate(audit.nextAuditDate)}</StatusBadge> : null}<StatusBadge tone="neutral">Findings {audit.findingsCount.minor + audit.findingsCount.major + audit.findingsCount.critical}</StatusBadge></div><AuditFindingsCard audit={audit} /><AuditDetailActions audit={audit} /><Separator /><div className="text-muted-foreground text-xs">Templates can be refined to match your exact certificate requirements.</div></div> : null}</DetailPanel>;
}

