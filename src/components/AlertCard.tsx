import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import { StatusBadge, type StatusTone } from "@/components/StatusBadge";

const DEFAULT_ICONS: Record<StatusTone, LucideIcon> = {
  compliant: CheckCircle2,
  warning: TriangleAlert,
  critical: TriangleAlert,
  info: Info,
  neutral: Info,
};

export function AlertCard({
  tone,
  title,
  description,
  meta,
  actions,
  icon,
}: {
  tone: StatusTone;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: LucideIcon;
}) {
  const Icon = icon ?? DEFAULT_ICONS[tone];

  return (
    <Card className="shadow-xs">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid shrink-0 size-9 place-items-center rounded-lg border",
              tone === "compliant" && "border-[var(--success-100)] bg-[var(--success-50)]",
              tone === "warning" && "border-[var(--warning-100)] bg-[var(--warning-50)]",
              tone === "critical" && "border-[var(--critical-100)] bg-[var(--critical-50)]",
              tone === "info" && "border-[var(--data-100)] bg-[var(--data-50)]",
              tone === "neutral" && "bg-muted border-border",
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{title}</div>
                  <StatusBadge tone={tone}>{tone}</StatusBadge>
                </div>
                {description ? (
                  <div className="text-muted-foreground mt-1 text-sm">
                    {description}
                  </div>
                ) : null}
              </div>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
            {meta ? <div className="mt-3 text-xs">{meta}</div> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
