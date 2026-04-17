import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_BOTTOM_WIDGET_ORDER,
  DEFAULT_BOTTOM_WIDGET_SPANS,
  DEFAULT_KPI_ORDER,
  DEFAULT_KPI_SPANS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_TOP_WIDGET_ORDER,
  DEFAULT_TOP_WIDGET_SPANS,
  arrayMove,
  clampDashboardSpan,
} from "./dashboard-layout.defaults";
import type {
  DashboardBottomWidgetKey,
  DashboardKpiKey,
  DashboardSectionKey,
  DashboardSpanMap,
  DashboardTopWidgetKey,
} from "./dashboard-layout.types";

export type {
  DashboardBottomWidgetKey,
  DashboardKpiKey,
  DashboardSectionKey,
  DashboardSpanMap,
  DashboardTopWidgetKey,
} from "./dashboard-layout.types";

type PersistedState = Partial<{
  kpiOrder: DashboardKpiKey[];
  kpiSpanByKey: DashboardSpanMap<DashboardKpiKey>;
  sectionOrder: DashboardSectionKey[];
  topWidgetOrder: DashboardTopWidgetKey[];
  topWidgetSpanByKey: DashboardSpanMap<DashboardTopWidgetKey>;
  bottomWidgetOrder: DashboardBottomWidgetKey[];
  bottomWidgetSpanByKey: DashboardSpanMap<DashboardBottomWidgetKey>;
}>;

export const useDashboardLayout = create<{
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
}>()(
  persist(
    (set, get) => ({
      kpiOrder: DEFAULT_KPI_ORDER,
      kpiSpanByKey: DEFAULT_KPI_SPANS,
      sectionOrder: DEFAULT_SECTION_ORDER,
      topWidgetOrder: DEFAULT_TOP_WIDGET_ORDER,
      topWidgetSpanByKey: DEFAULT_TOP_WIDGET_SPANS,
      bottomWidgetOrder: DEFAULT_BOTTOM_WIDGET_ORDER,
      bottomWidgetSpanByKey: DEFAULT_BOTTOM_WIDGET_SPANS,
      setKpiOrder: (order) => set({ kpiOrder: order }),
      setKpiSpan: (key, span) =>
        set((state) => ({
          kpiSpanByKey: { ...state.kpiSpanByKey, [key]: clampDashboardSpan(span) },
        })),
      moveSection: (fromKey, toKey) => {
        const { sectionOrder } = get();
        const from = sectionOrder.indexOf(fromKey);
        const to = sectionOrder.indexOf(toKey);
        if (from < 0 || to < 0 || from === to) return;
        set({ sectionOrder: arrayMove(sectionOrder, from, to) });
      },
      moveKpi: (fromKey, toKey) => {
        const { kpiOrder } = get();
        const from = kpiOrder.indexOf(fromKey);
        const to = kpiOrder.indexOf(toKey);
        if (from < 0 || to < 0 || from === to) return;
        set({ kpiOrder: arrayMove(kpiOrder, from, to) });
      },
      moveTopWidget: (fromKey, toKey) => {
        const { topWidgetOrder } = get();
        const from = topWidgetOrder.indexOf(fromKey);
        const to = topWidgetOrder.indexOf(toKey);
        if (from < 0 || to < 0 || from === to) return;
        set({ topWidgetOrder: arrayMove(topWidgetOrder, from, to) });
      },
      setTopWidgetSpan: (key, span) =>
        set((state) => ({
          topWidgetSpanByKey: { ...state.topWidgetSpanByKey, [key]: clampDashboardSpan(span) },
        })),
      moveBottomWidget: (fromKey, toKey) => {
        const { bottomWidgetOrder } = get();
        const from = bottomWidgetOrder.indexOf(fromKey);
        const to = bottomWidgetOrder.indexOf(toKey);
        if (from < 0 || to < 0 || from === to) return;
        set({ bottomWidgetOrder: arrayMove(bottomWidgetOrder, from, to) });
      },
      setBottomWidgetSpan: (key, span) =>
        set((state) => ({
          bottomWidgetSpanByKey: { ...state.bottomWidgetSpanByKey, [key]: clampDashboardSpan(span) },
        })),
      reset: () =>
        set({
          kpiOrder: DEFAULT_KPI_ORDER,
          kpiSpanByKey: DEFAULT_KPI_SPANS,
          sectionOrder: DEFAULT_SECTION_ORDER,
          topWidgetOrder: DEFAULT_TOP_WIDGET_ORDER,
          topWidgetSpanByKey: DEFAULT_TOP_WIDGET_SPANS,
          bottomWidgetOrder: DEFAULT_BOTTOM_WIDGET_ORDER,
          bottomWidgetSpanByKey: DEFAULT_BOTTOM_WIDGET_SPANS,
        }),
    }),
    {
      name: "ems-dashboard-layout-v1",
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as PersistedState;
        return {
          kpiOrder: state.kpiOrder ?? DEFAULT_KPI_ORDER,
          kpiSpanByKey: state.kpiSpanByKey ?? DEFAULT_KPI_SPANS,
          sectionOrder: state.sectionOrder ?? DEFAULT_SECTION_ORDER,
          topWidgetOrder: state.topWidgetOrder ?? DEFAULT_TOP_WIDGET_ORDER,
          topWidgetSpanByKey: state.topWidgetSpanByKey ?? DEFAULT_TOP_WIDGET_SPANS,
          bottomWidgetOrder: state.bottomWidgetOrder ?? DEFAULT_BOTTOM_WIDGET_ORDER,
          bottomWidgetSpanByKey: state.bottomWidgetSpanByKey ?? DEFAULT_BOTTOM_WIDGET_SPANS,
        };
      },
    },
  ),
);

