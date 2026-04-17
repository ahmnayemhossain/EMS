import * as React from "react";

import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useDashboardLayout } from "@/app/state/dashboard-layout";
import { ActivityList, type ActivityItem } from "@/components/ActivityList";
import { MobileHScroll } from "@/components/MobileHScroll";
import { TimelineList, type TimelineItem } from "@/components/TimelineList";
import type { Document } from "@/types/ems";

import { DashboardGridItem } from "./DashboardGridItem";
import { ExpiringDocsCard } from "./ExpiringDocsCard";

export function DashboardBottomWidgets({
  overdueActions,
  recentUploads,
  expiringDocuments,
  rearrangeEnabled,
}: {
  overdueActions: TimelineItem[];
  recentUploads: ActivityItem[];
  expiringDocuments: Document[];
  rearrangeEnabled?: boolean;
}) {
  const isMobile = useIsMobile();
  const enabled = Boolean(rearrangeEnabled) && !isMobile;
  const {
    bottomWidgetOrder,
    moveBottomWidget,
    bottomWidgetSpanByKey,
    setBottomWidgetSpan,
  } = useDashboardLayout();
  const gridRef = React.useRef<HTMLDivElement | null>(null);

  if (isMobile) {
    return (
      <MobileHScroll>
        <div className="w-[min(92vw,420px)] shrink-0">
          <TimelineList title="Overdue actions" items={overdueActions} />
        </div>
        <div className="w-[min(92vw,420px)] shrink-0">
          <ActivityList title="Recent uploads" items={recentUploads} />
        </div>
        <div className="w-[min(92vw,520px)] shrink-0">
          <ExpiringDocsCard documents={expiringDocuments} />
        </div>
      </MobileHScroll>
    );
  }

  const itemsByKey = {
    overdueActions: <TimelineList title="Overdue actions" items={overdueActions} />,
    recentUploads: <ActivityList title="Recent uploads" items={recentUploads} />,
    expiringDocuments: <ExpiringDocsCard documents={expiringDocuments} />,
  } as const;

  return (
    <div ref={gridRef} className="grid grid-cols-12 gap-4">
      {bottomWidgetOrder.map((key) => (
        <DashboardGridItem
          key={key}
          dndType="dashboard-bottom-widget"
          id={key}
          enabled={enabled}
          gridRef={gridRef}
          span={bottomWidgetSpanByKey[key] ?? 4}
          minSpan={3}
          maxSpan={12}
          onMove={moveBottomWidget}
          onSpanChange={(next) => setBottomWidgetSpan(key, next)}
        >
          {itemsByKey[key]}
        </DashboardGridItem>
      ))}
    </div>
  );
}
