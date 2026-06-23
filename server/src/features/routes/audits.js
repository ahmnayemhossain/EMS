import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";
import { createAuditRecord } from "./audits/handlers/create-record.js";
import { deleteAuditRecord } from "./audits/handlers/delete-record.js";
import { getAuditRecord } from "./audits/handlers/get-record.js";
import { listAuditRecords } from "./audits/handlers/list-records.js";

export const auditsRouter = Router();

auditsRouter.get("/", requirePermission("audits:read"), listAuditRecords);
auditsRouter.get("/:id", requirePermission("audits:read"), getAuditRecord);
auditsRouter.post("/", requirePermission("audits:write"), createAuditRecord);
auditsRouter.delete("/:id", requirePermission("audits:delete"), deleteAuditRecord);
