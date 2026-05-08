import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";
import { listActiveReportDefinitionsHandler, runReportHandler } from "./reports/handlers.js";

export const reportsRouter = Router();

reportsRouter.get("/definitions", requirePermission("reports:read"), listActiveReportDefinitionsHandler);
reportsRouter.post("/:key/run", requirePermission("reports:read"), runReportHandler);

