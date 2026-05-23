import {
  DEFAULT_DASHBOARD_BUILDER_STATE,
  arrayMove,
  clampRect,
  clampRows,
  clampSpan,
} from '../slices/dashboard-builder.defaults';
import type {
  DashboardContainer,
  DashboardWidget,
} from '../slices/dashboard-builder.types';

import { defaultLayout, insertIntoArray, removeFromArray } from './helpers';
import type { DashboardBuilderStore } from './store-types';

export function createDashboardBuilderStore(
  set: any,
  get: any,
): DashboardBuilderStore {
  return {
    ...DEFAULT_DASHBOARD_BUILDER_STATE,
    setContainerLayout: (containerId, layout) =>
      set((state: DashboardBuilderStore) => ({
        containers: state.containers.map((item) =>
          item.id === containerId
            ? { ...item, layout: clampRect(layout) }
            : item,
        ),
      })),
    setContainerTitle: (containerId, title) =>
      set((state: DashboardBuilderStore) => ({
        containers: state.containers.map((item) =>
          item.id === containerId
            ? { ...item, title: title.trim() || item.title }
            : item,
        ),
      })),
    toggleContainerCollapsed: (containerId) =>
      set((state: DashboardBuilderStore) => ({
        containers: state.containers.map((item) =>
          item.id === containerId
            ? { ...item, collapsed: !item.collapsed }
            : item,
        ),
      })),
    addContainer: (title) =>
      set((state: DashboardBuilderStore) => ({
        containers: [
          ...state.containers,
          {
            id: `c_${Date.now()}`,
            title: title.trim() || 'Container',
            widgetIds: [],
            layout: defaultLayout(
              Math.max(
                0,
                ...state.containers.map((item) =>
                  item.layout ? item.layout.y + item.layout.h : 0,
                ),
              ),
            ),
          },
        ],
      })),
    removeContainer: (containerId) =>
      set((state: DashboardBuilderStore) => {
        const container = state.containers.find(
          (item) => item.id === containerId,
        );
        const removeIds = new Set(container?.widgetIds ?? []);
        return {
          containers: state.containers.filter(
            (item) => item.id !== containerId,
          ),
          widgetsById: Object.fromEntries(
            Object.entries(state.widgetsById).filter(
              ([id]) => !removeIds.has(id),
            ),
          ),
        };
      }),
    moveWidget: (widgetId, from, to) => {
      const fromContainer = get().containers.find(
        (item: DashboardContainer) => item.id === from.containerId,
      );
      const toContainer = get().containers.find(
        (item: DashboardContainer) => item.id === to.containerId,
      );
      if (!fromContainer || !toContainer) return;
      set((state: DashboardBuilderStore) => ({
        containers: state.containers.map((item) => {
          if (
            item.id === from.containerId &&
            from.containerId === to.containerId
          ) {
            const currentIndex = item.widgetIds.indexOf(widgetId);
            return currentIndex < 0 || currentIndex === to.index
              ? item
              : {
                  ...item,
                  widgetIds: arrayMove(item.widgetIds, currentIndex, to.index),
                };
          }
          if (item.id === from.containerId)
            return {
              ...item,
              widgetIds: removeFromArray(item.widgetIds, widgetId),
            };
          if (item.id === to.containerId)
            return {
              ...item,
              widgetIds: insertIntoArray(
                removeFromArray(item.widgetIds, widgetId),
                to.index,
                widgetId,
              ),
            };
          return item;
        }),
      }));
    },
    setWidgetSpan: (widgetId, span) =>
      set((state: DashboardBuilderStore) => {
        const widget = state.widgetsById[widgetId];
        return !widget
          ? state
          : {
              widgetsById: {
                ...state.widgetsById,
                [widgetId]: { ...widget, span: clampSpan(span) },
              },
            };
      }),
    setWidgetRows: (widgetId, rows) =>
      set((state: DashboardBuilderStore) => {
        const widget = state.widgetsById[widgetId];
        return !widget
          ? state
          : {
              widgetsById: {
                ...state.widgetsById,
                [widgetId]: { ...widget, rows: clampRows(rows) },
              },
            };
      }),
    addWidgetToContainer: (containerId, widget) =>
      set((state: DashboardBuilderStore) => ({
        widgetsById: {
          ...state.widgetsById,
          [widget.id]: {
            ...widget,
            span: clampSpan(widget.span),
            rows: clampRows(widget.rows ?? 2),
          } as DashboardWidget,
        },
        containers: state.containers.map((item) =>
          item.id === containerId
            ? { ...item, widgetIds: [...item.widgetIds, widget.id] }
            : item,
        ),
      })),
    removeWidget: (widgetId) =>
      set((state: DashboardBuilderStore) => ({
        widgetsById: Object.fromEntries(
          Object.entries(state.widgetsById).filter(([id]) => id !== widgetId),
        ),
        containers: state.containers.map((item) => ({
          ...item,
          widgetIds: item.widgetIds.filter((id) => id !== widgetId),
        })),
      })),
    reset: () => set({ ...DEFAULT_DASHBOARD_BUILDER_STATE }),
  };
}
