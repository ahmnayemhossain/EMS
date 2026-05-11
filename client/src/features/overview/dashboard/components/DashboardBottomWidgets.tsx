import * as React from "react";

import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { useDashboardLayout } from "@/core/app/state/slices/dashboard-layout";
import { ActivityList, type ActivityItem } from "@/components/layout/primitives/ActivityList";
import { MobileHScroll } from "@/components/layout/primitives/MobileHScroll";
import { TimelineList, type TimelineItem } from "@/components/layout/primitives/TimelineList";
import type { Document } from "@/core/types/models/ems";

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
      {bottomWidgetOrder.map((key, idx) => (
        <DashboardGridItem
          key={key}
          dndType="dashboard-bottom-widget"
          id={key}
          index={idx}
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

