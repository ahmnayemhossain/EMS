import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { getApprovalHierarchyConfig, replaceApprovalHierarchyConfig } from "./handlers.js";

export const approvalHierarchyRouter = Router();

approvalHierarchyRouter.get("/", requirePermission("settings:hierarchy:read"), getApprovalHierarchyConfig);
approvalHierarchyRouter.put("/", requirePermission("settings:hierarchy:update"), replaceApprovalHierarchyConfig);
