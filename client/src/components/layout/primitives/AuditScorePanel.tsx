import * as React from "react";

import { cn } from "@/components/ui/primitives/utils";
import { StatusBadge } from "@/components/feedback/StatusBadge";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function AuditScorePanel({
  score,
  label = "Audit readiness",
  className,
}: {
  score: number; // 0-100
  label?: string;
  className?: string;
}) {
  const pct = clamp(score, 0, 100);
  const tone = pct >= 85 ? "compliant" : pct >= 70 ? "warning" : "critical";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="grid shrink-0 size-11 md:size-12 place-items-center rounded-full border"
        style={{
          background: `conic-gradient(var(--ring) ${pct}%, var(--muted) 0)`,
        }}
      >
        <div className="bg-background grid size-8 md:size-9 place-items-center rounded-full border text-xs font-semibold">
          {pct}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="mt-1">
          <StatusBadge tone={tone}>{tone}</StatusBadge>
        </div>
      </div>
    </div>
  );
}

