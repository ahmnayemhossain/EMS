import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_BOTTOM_WIDGET_ORDER, DEFAULT_BOTTOM_WIDGET_SPANS, DEFAULT_KPI_ORDER, DEFAULT_KPI_SPANS, DEFAULT_SECTION_ORDER, DEFAULT_TOP_WIDGET_ORDER, DEFAULT_TOP_WIDGET_SPANS } from "./dashboard-layout.defaults";
import type { DashboardBottomWidgetKey, DashboardKpiKey, DashboardSectionKey, DashboardSpanMap, DashboardTopWidgetKey } from "./dashboard-layout.types";
import { createDashboardLayoutStore } from "./dashboard-layout/store-creator";
import type { DashboardLayoutStore, PersistedDashboardLayoutState } from "./dashboard-layout/store-types";

export type { DashboardBottomWidgetKey, DashboardKpiKey, DashboardSectionKey, DashboardSpanMap, DashboardTopWidgetKey } from "./dashboard-layout.types";

export const useDashboardLayout = create<DashboardLayoutStore>()(persist(createDashboardLayoutStore, { name: "ems-dashboard-layout-v1", version: 2, migrate: (persisted) => { const state = (persisted ?? {}) as PersistedDashboardLayoutState; return { kpiOrder: state.kpiOrder ?? DEFAULT_KPI_ORDER, kpiSpanByKey: state.kpiSpanByKey ?? DEFAULT_KPI_SPANS, sectionOrder: state.sectionOrder ?? DEFAULT_SECTION_ORDER, topWidgetOrder: state.topWidgetOrder ?? DEFAULT_TOP_WIDGET_ORDER, topWidgetSpanByKey: state.topWidgetSpanByKey ?? DEFAULT_TOP_WIDGET_SPANS, bottomWidgetOrder: state.bottomWidgetOrder ?? DEFAULT_BOTTOM_WIDGET_ORDER, bottomWidgetSpanByKey: state.bottomWidgetSpanByKey ?? DEFAULT_BOTTOM_WIDGET_SPANS }; } }));
