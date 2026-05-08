import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { listUtilityConversionRules, upsertUtilityConversionRule } from "./handlers.js";

export const utilityConversionRulesRouter = Router();

utilityConversionRulesRouter.get("/", requirePermission("settings:utilities-rules:read"), listUtilityConversionRules);
utilityConversionRulesRouter.put("/", requirePermission("settings:utilities-rules:update"), upsertUtilityConversionRule);

