import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_DASHBOARD_BUILDER_STATE,
  arrayMove,
  clampSpan,
} from "./dashboard-builder.defaults";
import type {
  DashboardBuilderState,
  DashboardContainer,
  DashboardWidget,
  DashboardWidgetLocation,
} from "./dashboard-builder.types";

type PersistedState = Partial<DashboardBuilderState>;

function removeFromArray(arr: string[], value: string) {
  const idx = arr.indexOf(value);
  if (idx < 0) return arr;
  const next = arr.slice();
  next.splice(idx, 1);
  return next;
}

function insertIntoArray(arr: string[], idx: number, value: string) {
  const next = arr.slice();
  const clamped = Math.max(0, Math.min(next.length, idx));
  next.splice(clamped, 0, value);
  return next;
}

export const useDashboardBuilder = create<DashboardBuilderState & {
  moveContainer: (fromIndex: number, toIndex: number) => void;
  setContainerTitle: (containerId: string, title: string) => void;
  toggleContainerCollapsed: (containerId: string) => void;
  addContainer: (title: string) => void;
  removeContainer: (containerId: string) => void;
  moveWidget: (
    widgetId: string,
    from: DashboardWidgetLocation,
    to: DashboardWidgetLocation,
  ) => void;
  setWidgetSpan: (widgetId: string, span: number) => void;
  addWidgetToContainer: (containerId: string, widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  reset: () => void;
}>()(
  persist(
    (set, get) => ({
      ...DEFAULT_DASHBOARD_BUILDER_STATE,
      moveContainer: (fromIndex, toIndex) => {
        const { containers } = get();
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || toIndex < 0) return;
        if (fromIndex >= containers.length || toIndex >= containers.length) return;
        set({ containers: arrayMove(containers, fromIndex, toIndex) });
      },
      setContainerTitle: (containerId, title) =>
        set((state) => ({
          containers: state.containers.map((c) =>
            c.id === containerId ? { ...c, title: title.trim() || c.title } : c,
          ),
        })),
      toggleContainerCollapsed: (containerId) =>
        set((state) => ({
          containers: state.containers.map((c) =>
            c.id === containerId ? { ...c, collapsed: !c.collapsed } : c,
          ),
        })),
      addContainer: (title) =>
        set((state) => ({
          containers: [
            ...state.containers,
            {
              id: `c_${Date.now()}`,
              title: title.trim() || "Container",
              widgetIds: [],
            },
          ],
        })),
      removeContainer: (containerId) =>
        set((state) => {
          const container = state.containers.find((c) => c.id === containerId);
          const removeIds = new Set(container?.widgetIds ?? []);
          const nextWidgets = Object.fromEntries(
            Object.entries(state.widgetsById).filter(([id]) => !removeIds.has(id)),
          );
          return {
            containers: state.containers.filter((c) => c.id !== containerId),
            widgetsById: nextWidgets,
          };
        }),
      moveWidget: (widgetId, from, to) => {
        const { containers } = get();
        const fromContainer = containers.find((c) => c.id === from.containerId);
        const toContainer = containers.find((c) => c.id === to.containerId);
        if (!fromContainer || !toContainer) return;

        set((state) => {
          const nextContainers: DashboardContainer[] = state.containers.map((c) => {
            if (c.id === from.containerId && from.containerId === to.containerId) {
              const currentIdx = c.widgetIds.indexOf(widgetId);
              if (currentIdx < 0) return c;
              if (currentIdx === to.index) return c;
              return { ...c, widgetIds: arrayMove(c.widgetIds, currentIdx, to.index) };
            }

            if (c.id === from.containerId) {
              return { ...c, widgetIds: removeFromArray(c.widgetIds, widgetId) };
            }
            if (c.id === to.containerId) {
              const cleaned = removeFromArray(c.widgetIds, widgetId);
              return { ...c, widgetIds: insertIntoArray(cleaned, to.index, widgetId) };
            }
            return c;
          });

          return { containers: nextContainers };
        });
      },
      setWidgetSpan: (widgetId, span) =>
        set((state) => {
          const widget = state.widgetsById[widgetId];
          if (!widget) return state;
          return {
            widgetsById: {
              ...state.widgetsById,
              [widgetId]: { ...widget, span: clampSpan(span) },
            },
          };
        }),
      addWidgetToContainer: (containerId, widget) =>
        set((state) => ({
          widgetsById: { ...state.widgetsById, [widget.id]: widget },
          containers: state.containers.map((c) =>
            c.id === containerId ? { ...c, widgetIds: [...c.widgetIds, widget.id] } : c,
          ),
        })),
      removeWidget: (widgetId) =>
        set((state) => ({
          widgetsById: Object.fromEntries(
            Object.entries(state.widgetsById).filter(([id]) => id !== widgetId),
          ),
          containers: state.containers.map((c) => ({
            ...c,
            widgetIds: c.widgetIds.filter((id) => id !== widgetId),
          })),
        })),
      reset: () => set({ ...DEFAULT_DASHBOARD_BUILDER_STATE }),
    }),
    {
      name: "ems-dashboard-builder-v1",
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as PersistedState;
        return {
          containers: state.containers ?? DEFAULT_DASHBOARD_BUILDER_STATE.containers,
          widgetsById: state.widgetsById ?? DEFAULT_DASHBOARD_BUILDER_STATE.widgetsById,
        };
      },
    },
  ),
);
