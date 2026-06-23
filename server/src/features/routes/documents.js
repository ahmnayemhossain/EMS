import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";
import { createDocumentRecord } from "./documents/handlers/create-record.js";
import { deleteDocumentRecord } from "./documents/handlers/delete-record.js";
import { getDocumentRecord } from "./documents/handlers/get-record.js";
import { listDocumentRecords } from "./documents/handlers/list-records.js";
import { updateDocumentRecord } from "./documents/handlers/update-record.js";

export const documentsRouter = Router();

documentsRouter.get("/", requirePermission("documents:read"), listDocumentRecords);
documentsRouter.get("/:id", requirePermission("documents:read"), getDocumentRecord);
documentsRouter.post("/", requirePermission("documents:write"), createDocumentRecord);
documentsRouter.put("/:id", requirePermission("documents:update"), updateDocumentRecord);
documentsRouter.delete("/:id", requirePermission("documents:delete"), deleteDocumentRecord);
