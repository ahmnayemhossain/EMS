import * as React from "react";

import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useDashboardLayout } from "@/app/state/dashboard-layout";
import { MobileHScroll } from "@/components/MobileHScroll";
import type { Audit, Notification } from "@/types/ems";

import { AuditCalendarCard } from "./AuditCalendarCard";
import { ComplianceAlertsCard } from "./ComplianceAlertsCard";
import { DashboardGridItem } from "./DashboardGridItem";
import { UtilityTrendCard, type UtilityTrendPoint } from "./UtilityTrendCard";

export function DashboardTopWidgets({
  utilityTrend,
  notifications,
  audits,
  rearrangeEnabled,
}: {
  utilityTrend: UtilityTrendPoint[];
  notifications: Notification[];
  audits: Audit[];
  rearrangeEnabled?: boolean;
}) {
  const isMobile = useIsMobile();
  const enabled = Boolean(rearrangeEnabled) && !isMobile;
  const selectedDate = new Date(audits[0]?.date ?? Date.now());
  const { topWidgetOrder, moveTopWidget, topWidgetSpanByKey, setTopWidgetSpan } =
    useDashboardLayout();
  const gridRef = React.useRef<HTMLDivElement | null>(null);

  if (isMobile) {
    return (
      <MobileHScroll>
        <div className="w-[min(92vw,560px)] shrink-0">
          <UtilityTrendCard points={utilityTrend} />
        </div>
        <div className="w-[min(92vw,420px)] shrink-0">
          <ComplianceAlertsCard items={notifications.slice(0, 3)} />
        </div>
        <div className="w-[min(92vw,420px)] shrink-0">
          <AuditCalendarCard selectedDate={selectedDate} />
        </div>
      </MobileHScroll>
    );
  }

  const itemsByKey = {
    utilityTrend: <UtilityTrendCard points={utilityTrend} />,
    alerts: <ComplianceAlertsCard items={notifications.slice(0, 3)} />,
    calendar: <AuditCalendarCard selectedDate={selectedDate} />,
  } as const;

  return (
    <div ref={gridRef} className="grid grid-cols-12 gap-4">
      {topWidgetOrder.map((key) => (
        <DashboardGridItem
          key={key}
          dndType="dashboard-top-widget"
          id={key}
          enabled={enabled}
          gridRef={gridRef}
          span={topWidgetSpanByKey[key] ?? (key === "utilityTrend" ? 8 : 4)}
          minSpan={3}
          maxSpan={12}
          onMove={moveTopWidget}
          onSpanChange={(next) => setTopWidgetSpan(key, next)}
        >
          {itemsByKey[key]}
        </DashboardGridItem>
      ))}
    </div>
  );
}
