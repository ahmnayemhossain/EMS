import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_DASHBOARD_BUILDER_STATE, clampRect, clampRows } from "./dashboard-builder.defaults";
import type { DashboardWidget } from "./dashboard-builder.types";
import { createDashboardBuilderStore } from "../dashboard-builder/store-creator";
import type { PersistedDashboardBuilderState, DashboardBuilderStore } from "../dashboard-builder/store-types";

export const useDashboardBuilder = create<DashboardBuilderStore>()(persist(createDashboardBuilderStore, { name: "ems-dashboard-builder-v3", version: 3, migrate: (persisted) => { const state = (persisted ?? {}) as PersistedDashboardBuilderState; return { containers: (state.containers ?? DEFAULT_DASHBOARD_BUILDER_STATE.containers).map((item, index) => ({ ...item, layout: clampRect(item.layout ?? { x: 1, y: 1 + index * 9, w: 6, h: 8 }) })), widgetsById: Object.fromEntries(Object.entries(state.widgetsById ?? DEFAULT_DASHBOARD_BUILDER_STATE.widgetsById).map(([id, widget]) => [id, { ...widget, rows: clampRows((widget as DashboardWidget).rows ?? 3) }])) }; } }));
