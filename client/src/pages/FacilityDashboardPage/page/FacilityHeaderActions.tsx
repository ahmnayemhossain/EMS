import { AuditScorePanel } from "@/components/AuditScorePanel";
import { RiskBadge } from "@/components/RiskBadge";
import type { Facility } from "@/types/ems";

export function FacilityHeaderActions({ facility }: { facility: Facility }) {
  return <div className="flex items-center gap-2"><RiskBadge level={facility.riskLevel} /><AuditScorePanel score={facility.auditReadinessScore} /></div>;
}
