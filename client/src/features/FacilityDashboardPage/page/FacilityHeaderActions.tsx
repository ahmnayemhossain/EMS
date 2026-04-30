import { AuditScorePanel } from "@/core/components/AuditScorePanel";
import { RiskBadge } from "@/core/components/RiskBadge";
import type { Facility } from "@/core/types/ems";

export function FacilityHeaderActions({ facility }: { facility: Facility }) {
  return <div className="flex items-center gap-2"><RiskBadge level={facility.riskLevel} /><AuditScorePanel score={facility.auditReadinessScore} /></div>;
}
