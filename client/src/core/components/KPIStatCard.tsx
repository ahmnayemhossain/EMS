import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/core/app/components/ui/card";
import { cn } from "@/core/app/components/ui/utils";
import { StatusBadge, type StatusTone } from "@/core/components/StatusBadge";

const TONE_STYLES: Record<StatusTone, { card?: string; icon?: string }> = {
  compliant: {
    card: "border-l-4 border-l-[color-mix(in_oklab,var(--success-600)_38%,var(--border))]",
    icon: "border-[color-mix(in_oklab,var(--success-600)_20%,var(--border))] bg-[color-mix(in_oklab,var(--success-50)_55%,var(--background))] text-[var(--success-700)]",
  },
  warning: {
    card: "border-l-4 border-l-[color-mix(in_oklab,var(--warning-600)_38%,var(--border))]",
    icon: "border-[color-mix(in_oklab,var(--warning-600)_20%,var(--border))] bg-[color-mix(in_oklab,var(--warning-50)_55%,var(--background))] text-[var(--warning-700)]",
  },
  critical: {
    card: "border-l-4 border-l-[color-mix(in_oklab,var(--critical-600)_38%,var(--border))]",
    icon: "border-[color-mix(in_oklab,var(--critical-600)_20%,var(--border))] bg-[color-mix(in_oklab,var(--critical-50)_55%,var(--background))] text-[var(--critical-700)]",
  },
  info: {
    card: "border-l-4 border-l-[color-mix(in_oklab,var(--data-600)_38%,var(--border))]",
    icon: "border-[color-mix(in_oklab,var(--data-600)_20%,var(--border))] bg-[color-mix(in_oklab,var(--data-50)_55%,var(--background))] text-[var(--data-700)]",
  },
  neutral: {},
};

export function KPIStatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
  footer,
  onClick,
}: {
  title: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: LucideIcon;
  tone?: StatusTone;
  footer?: React.ReactNode;
  onClick?: () => void;
}) {
  const toneStyles = TONE_STYLES[tone];

  return (
    <Card
      className={cn(
        "shadow-xs hover:shadow-sm transition-shadow",
        toneStyles.card,
        onClick ? "cursor-pointer" : undefined,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-muted-foreground text-xs font-medium">
              {title}
            </div>
            <div className="mt-1 text-2xl font-semibold leading-none">
              {value}
            </div>
            {helper ? (
              <div className="text-muted-foreground mt-2 text-xs">
                {helper}
              </div>
            ) : null}
          </div>
          {Icon ? (
            <div
              className={cn(
                "bg-muted/40 text-muted-foreground grid shrink-0 size-10 md:size-11 place-items-center rounded-xl border",
                toneStyles.icon,
              )}
            >
              <Icon className="size-5 md:size-6" />
            </div>
          ) : (
            <StatusBadge tone={tone}>{tone.toUpperCase()}</StatusBadge>
          )}
        </div>
      </CardHeader>
      {footer ? (
        <CardContent className="pt-0">
          <div className="border-t pt-3 text-xs">{footer}</div>
        </CardContent>
      ) : null}
    </Card>
  );
}
