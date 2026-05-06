import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { createMeter, deleteMeter, listMeters, updateMeter } from "./handlers.js";

export const metersRouter = Router();

metersRouter.get("/", requirePermission("settings:meters:read"), listMeters);
metersRouter.post("/", requirePermission("settings:meters:write"), createMeter);
metersRouter.put("/:id", requirePermission("settings:meters:update"), updateMeter);
metersRouter.delete("/:id", requirePermission("settings:meters:delete"), deleteMeter);

