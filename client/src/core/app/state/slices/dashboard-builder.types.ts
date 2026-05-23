export type DashboardWidgetType = string;

export type DashboardWidget = {
  id: string;
  type: DashboardWidgetType;
  span: number; // 1..12
  rows?: number; // grid rows (1..N)
};

export type DashboardGridRect = {
  x: number; // 1..12 (css grid line start)
  y: number; // 1..N
  w: number; // 1..12
  h: number; // 1..N
};

export type DashboardContainer = {
  id: string;
  title: string;
  collapsed?: boolean;
  widgetIds: string[];
  layout?: DashboardGridRect;
};

export type DashboardBuilderState = {
  containers: DashboardContainer[];
  widgetsById: Record<string, DashboardWidget>;
};

export type DashboardWidgetLocation = {
  containerId: string;
  index: number;
};
