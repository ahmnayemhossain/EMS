import { DEFAULT_BOTTOM_WIDGET_ORDER, DEFAULT_BOTTOM_WIDGET_SPANS, DEFAULT_KPI_ORDER, DEFAULT_KPI_SPANS, DEFAULT_SECTION_ORDER, DEFAULT_TOP_WIDGET_ORDER, DEFAULT_TOP_WIDGET_SPANS, arrayMove, clampDashboardSpan } from "../slices/dashboard-layout.defaults";

import type { DashboardLayoutStore } from "./store-types";

export function createDashboardLayoutStore(set: any, get: any): DashboardLayoutStore {
  return {
    kpiOrder: DEFAULT_KPI_ORDER,
    kpiSpanByKey: DEFAULT_KPI_SPANS,
    sectionOrder: DEFAULT_SECTION_ORDER,
    topWidgetOrder: DEFAULT_TOP_WIDGET_ORDER,
    topWidgetSpanByKey: DEFAULT_TOP_WIDGET_SPANS,
    bottomWidgetOrder: DEFAULT_BOTTOM_WIDGET_ORDER,
    bottomWidgetSpanByKey: DEFAULT_BOTTOM_WIDGET_SPANS,
    setKpiOrder: (order) => set({ kpiOrder: order }),
    setKpiSpan: (key, span) => set((state: DashboardLayoutStore) => ({ kpiSpanByKey: { ...state.kpiSpanByKey, [key]: clampDashboardSpan(span) } })),
    moveSection: (fromKey, toKey) => { const order = get().sectionOrder; const from = order.indexOf(fromKey); const to = order.indexOf(toKey); if (from < 0 || to < 0 || from === to) return; set({ sectionOrder: arrayMove(order, from, to) }); },
    moveKpi: (fromKey, toKey) => { const order = get().kpiOrder; const from = order.indexOf(fromKey); const to = order.indexOf(toKey); if (from < 0 || to < 0 || from === to) return; set({ kpiOrder: arrayMove(order, from, to) }); },
    moveTopWidget: (fromKey, toKey) => { const order = get().topWidgetOrder; const from = order.indexOf(fromKey); const to = order.indexOf(toKey); if (from < 0 || to < 0 || from === to) return; set({ topWidgetOrder: arrayMove(order, from, to) }); },
    setTopWidgetSpan: (key, span) => set((state: DashboardLayoutStore) => ({ topWidgetSpanByKey: { ...state.topWidgetSpanByKey, [key]: clampDashboardSpan(span) } })),
    moveBottomWidget: (fromKey, toKey) => { const order = get().bottomWidgetOrder; const from = order.indexOf(fromKey); const to = order.indexOf(toKey); if (from < 0 || to < 0 || from === to) return; set({ bottomWidgetOrder: arrayMove(order, from, to) }); },
    setBottomWidgetSpan: (key, span) => set((state: DashboardLayoutStore) => ({ bottomWidgetSpanByKey: { ...state.bottomWidgetSpanByKey, [key]: clampDashboardSpan(span) } })),
    reset: () => set({ kpiOrder: DEFAULT_KPI_ORDER, kpiSpanByKey: DEFAULT_KPI_SPANS, sectionOrder: DEFAULT_SECTION_ORDER, topWidgetOrder: DEFAULT_TOP_WIDGET_ORDER, topWidgetSpanByKey: DEFAULT_TOP_WIDGET_SPANS, bottomWidgetOrder: DEFAULT_BOTTOM_WIDGET_ORDER, bottomWidgetSpanByKey: DEFAULT_BOTTOM_WIDGET_SPANS }),
  };
}
