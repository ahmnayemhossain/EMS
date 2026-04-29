import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { createRole, deleteRole, listRoleLookups, listRoles, updateRole } from "./handlers.js";

export const rolesRouter = Router();

rolesRouter.get("/lookups/options", listRoleLookups);
rolesRouter.get("/", requirePermission("settings:roles:read"), listRoles);
rolesRouter.post("/", requirePermission("settings:roles:write"), createRole);
rolesRouter.put("/:id", requirePermission("settings:roles:update"), updateRole);
rolesRouter.delete("/:id", requirePermission("settings:roles:delete"), deleteRole);
