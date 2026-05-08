import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import {
  createReportDefinition,
  deleteReportDefinition,
  listReportDefinitions,
  updateReportDefinition,
} from "./handlers.js";

export const reportDefinitionsRouter = Router();

reportDefinitionsRouter.get("/", requirePermission("settings:reports:read"), listReportDefinitions);
reportDefinitionsRouter.post("/", requirePermission("settings:reports:write"), createReportDefinition);
reportDefinitionsRouter.put("/:id", requirePermission("settings:reports:update"), updateReportDefinition);
reportDefinitionsRouter.delete("/:id", requirePermission("settings:reports:delete"), deleteReportDefinition);

