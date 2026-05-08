import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { getEmailSettings, upsertEmailSettings } from "./handlers.js";

export const emailSettingsRouter = Router();

emailSettingsRouter.get("/:key", requirePermission("settings:email:read"), getEmailSettings);
emailSettingsRouter.put("/:key", requirePermission("settings:email:update"), upsertEmailSettings);
