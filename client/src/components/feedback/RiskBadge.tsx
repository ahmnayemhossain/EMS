import { AlertTriangle, ShieldCheck, TriangleAlert } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";

export type RiskLevel = "low" | "medium" | "high";

export function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === "low") {
    return (
      <StatusBadge tone="compliant">
        <ShieldCheck className="size-3" />
        Low risk
      </StatusBadge>
    );
  }

  if (level === "medium") {
    return (
      <StatusBadge tone="warning">
        <AlertTriangle className="size-3" />
        Medium risk
      </StatusBadge>
    );
  }

  return (
    <StatusBadge tone="critical">
      <TriangleAlert className="size-3" />
      High risk
    </StatusBadge>
  );
}


