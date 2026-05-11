import * as React from "react";

import { Badge } from "@/components/ui/primitives/badge";
import { cn } from "@/components/ui/primitives/utils";

export type StatusTone =
  | "compliant"
  | "warning"
  | "critical"
  | "info"
  | "neutral";

const TONE_STYLES: Record<StatusTone, string> = {
  compliant:
    "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--success-900)]",
  warning:
    "border-[var(--warning-100)] bg-[var(--warning-50)] text-[var(--warning-900)]",
  critical:
    "border-[var(--critical-100)] bg-[var(--critical-50)] text-[var(--critical-900)]",
  info: "border-[var(--data-100)] bg-[var(--data-50)] text-[var(--data-900)]",
  neutral: "bg-muted text-foreground border-border",
};

export function StatusBadge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border text-xs font-medium", TONE_STYLES[tone], className)}
    >
      {children}
    </Badge>
  );
}


