import type { DashboardBottomWidgetKey, DashboardKpiKey, DashboardSectionKey, DashboardSpanMap, DashboardTopWidgetKey } from "../dashboard-layout.types";

export type PersistedDashboardLayoutState = Partial<{
  kpiOrder: DashboardKpiKey[];
  kpiSpanByKey: DashboardSpanMap<DashboardKpiKey>;
  sectionOrder: DashboardSectionKey[];
  topWidgetOrder: DashboardTopWidgetKey[];
  topWidgetSpanByKey: DashboardSpanMap<DashboardTopWidgetKey>;
  bottomWidgetOrder: DashboardBottomWidgetKey[];
  bottomWidgetSpanByKey: DashboardSpanMap<DashboardBottomWidgetKey>;
}>;

export type DashboardLayoutStore = {
  kpiOrder: DashboardKpiKey[];
  kpiSpanByKey: DashboardSpanMap<DashboardKpiKey>;
  sectionOrder: DashboardSectionKey[];
  topWidgetOrder: DashboardTopWidgetKey[];
  topWidgetSpanByKey: DashboardSpanMap<DashboardTopWidgetKey>;
  bottomWidgetOrder: DashboardBottomWidgetKey[];
  bottomWidgetSpanByKey: DashboardSpanMap<DashboardBottomWidgetKey>;
  setKpiOrder: (order: DashboardKpiKey[]) => void;
  setKpiSpan: (key: DashboardKpiKey, span: number) => void;
  moveSection: (fromKey: DashboardSectionKey, toKey: DashboardSectionKey) => void;
  moveKpi: (fromKey: DashboardKpiKey, toKey: DashboardKpiKey) => void;
  moveTopWidget: (fromKey: DashboardTopWidgetKey, toKey: DashboardTopWidgetKey) => void;
  setTopWidgetSpan: (key: DashboardTopWidgetKey, span: number) => void;
  moveBottomWidget: (fromKey: DashboardBottomWidgetKey, toKey: DashboardBottomWidgetKey) => void;
  setBottomWidgetSpan: (key: DashboardBottomWidgetKey, span: number) => void;
  reset: () => void;
};
