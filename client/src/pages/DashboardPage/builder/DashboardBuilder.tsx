import * as React from "react";

import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useDashboardBuilder } from "@/app/state/dashboard-builder";
import type { DashboardWidget } from "@/app/state/dashboard-builder.types";

import { ContainerItem } from "./container/ContainerItem";
import type { DashboardWidgetData } from "./widgetRegistry";

function makeWidgetId() {
  return `w_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function DashboardBuilder({
  enabled,
  data,
}: {
  enabled: boolean;
  data: DashboardWidgetData;
}) {
  const isMobile = useIsMobile();
  const {
    containers,
    widgetsById,
    moveContainer,
    setContainerTitle,
    toggleContainerCollapsed,
    removeContainer,
    moveWidget,
    setWidgetSpan,
    addWidgetToContainer,
    removeWidget,
  } = useDashboardBuilder();

  const resolvedContainers = React.useMemo(() => {
    return containers.map((c) => ({
      ...c,
      widgets: c.widgetIds.map((id) => widgetsById[id]).filter(Boolean) as DashboardWidget[],
    }));
  }, [containers, widgetsById]);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {resolvedContainers.map((c, idx) => (
          <ContainerItem
            key={c.id}
            container={c}
            index={idx}
            widgets={c.widgets}
            enabled={enabled && !isMobile}
            data={data}
            onMoveContainer={moveContainer}
            onToggleCollapsed={() => toggleContainerCollapsed(c.id)}
            onRename={(title) => setContainerTitle(c.id, title)}
            onRemoveContainer={() => removeContainer(c.id)}
            onAddWidget={(type, defaultSpan) => {
              addWidgetToContainer(c.id, { id: makeWidgetId(), type, span: defaultSpan });
            }}
            onMoveWidget={moveWidget}
            onSpanChange={(widgetId, span) => setWidgetSpan(widgetId, span)}
            onRemoveWidget={(widgetId) => removeWidget(widgetId)}
          />
        ))}
      </div>
    </div>
  );
}
