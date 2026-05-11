import { AuditScorePanel } from "@/components/layout/primitives/AuditScorePanel";
import { RiskBadge } from "@/components/feedback/RiskBadge";
import type { Facility } from "@/core/types/models/ems";

export function FacilityHeaderActions({ facility }: { facility: Facility }) {
  return <div className="flex items-center gap-2"><RiskBadge level={facility.riskLevel} /><AuditScorePanel score={facility.auditReadinessScore} /></div>;
}

