import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import {
  createDashboardWidget,
  deleteDashboardWidget,
  listDashboardWidgets,
  updateDashboardWidget,
} from "./handlers.js";

export const dashboardWidgetsRouter = Router();

dashboardWidgetsRouter.get(
  "/",
  requirePermission("settings:dashboard_widgets:read"),
  listDashboardWidgets,
);
dashboardWidgetsRouter.post(
  "/",
  requirePermission("settings:dashboard_widgets:write"),
  createDashboardWidget,
);
dashboardWidgetsRouter.put(
  "/:id",
  requirePermission("settings:dashboard_widgets:update"),
  updateDashboardWidget,
);
dashboardWidgetsRouter.delete(
  "/:id",
  requirePermission("settings:dashboard_widgets:delete"),
  deleteDashboardWidget,
);
