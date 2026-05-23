import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createDashboardBuilderStore } from '../dashboard-builder/store-creator';
import type {
  DashboardBuilderStore,
  PersistedDashboardBuilderState,
} from '../dashboard-builder/store-types';
import {
  DEFAULT_DASHBOARD_BUILDER_STATE,
  clampRect,
  clampRows,
} from './dashboard-builder.defaults';
import type { DashboardWidget } from './dashboard-builder.types';

export const useDashboardBuilder = create<DashboardBuilderStore>()(
  persist(createDashboardBuilderStore, {
    name: 'ems-dashboard-builder-v4',
    version: 4,
    migrate: (persisted) => {
      const state = (persisted ?? {}) as PersistedDashboardBuilderState;
      return {
        containers: (
          state.containers ?? DEFAULT_DASHBOARD_BUILDER_STATE.containers
        ).map((item, index) => ({
          ...item,
          layout: clampRect(
            item.layout ?? { x: 1, y: 1 + index * 9, w: 2, h: 8 },
          ),
        })),
        widgetsById: Object.fromEntries(
          Object.entries(
            state.widgetsById ?? DEFAULT_DASHBOARD_BUILDER_STATE.widgetsById,
          ).map(([id, widget]) => [
            id,
            {
              ...widget,
              rows: clampRows((widget as DashboardWidget).rows ?? 2),
            },
          ]),
        ),
      };
    },
  }),
);
