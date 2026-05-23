import { createSystemHeaders, parseSystemResponse, SYSTEM_API } from "@/features/admin/settings/modules/api/system-api";
import type { DashboardWidgetPresetKey } from "@/features/overview/dashboard/config/widget-presets";

const DASHBOARD_WIDGETS_API = `${SYSTEM_API}/dashboard-widgets`;

export type DashboardWidgetEntity = {
  id: string;
  name: string;
  templateKey: DashboardWidgetPresetKey;
  description: string;
  defaultSpan: number;
  defaultRows: number;
  status: 0 | 1;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listDashboardWidgets(userId: string) {
  const response = await fetch(DASHBOARD_WIDGETS_API, {
    cache: "no-store",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<DashboardWidgetEntity[]>(
    response,
    "Could not load dashboard widgets.",
  );
}

export async function createDashboardWidget(
  widget: Omit<DashboardWidgetEntity, "id">,
  userId: string,
) {
  const response = await fetch(DASHBOARD_WIDGETS_API, {
    method: "POST",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(widget),
  });
  return parseSystemResponse<DashboardWidgetEntity>(
    response,
    "Could not create dashboard widget.",
  );
}

export async function updateDashboardWidget(
  widget: DashboardWidgetEntity,
  userId: string,
) {
  const response = await fetch(`${DASHBOARD_WIDGETS_API}/${widget.id}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(widget),
  });
  return parseSystemResponse<DashboardWidgetEntity>(
    response,
    "Could not save dashboard widget.",
  );
}

export async function deleteDashboardWidget(id: string, userId: string) {
  const response = await fetch(`${DASHBOARD_WIDGETS_API}/${id}`, {
    method: "DELETE",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<{ ok: true }>(
    response,
    "Could not delete dashboard widget.",
  );
}
