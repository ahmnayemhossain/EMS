import type { DashboardBuilderState, DashboardGridRect, DashboardWidget, DashboardWidgetLocation } from "../dashboard-builder.types";

export type PersistedDashboardBuilderState = Partial<DashboardBuilderState>;

export type DashboardBuilderStore = DashboardBuilderState & {
  setContainerLayout: (containerId: string, layout: DashboardGridRect) => void;
  setContainerTitle: (containerId: string, title: string) => void;
  toggleContainerCollapsed: (containerId: string) => void;
  addContainer: (title: string) => void;
  removeContainer: (containerId: string) => void;
  moveWidget: (widgetId: string, from: DashboardWidgetLocation, to: DashboardWidgetLocation) => void;
  setWidgetSpan: (widgetId: string, span: number) => void;
  setWidgetRows: (widgetId: string, rows: number) => void;
  addWidgetToContainer: (containerId: string, widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  reset: () => void;
};
