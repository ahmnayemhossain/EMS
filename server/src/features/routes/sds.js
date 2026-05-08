import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";
import { createSdsRecord } from "./sds/handlers/create-record.js";
import { deleteSdsRecord } from "./sds/handlers/delete-record.js";
import { getSdsRecord } from "./sds/handlers/get-record.js";
import { listSdsRecords } from "./sds/handlers/list-records.js";
import { updateSdsRecord } from "./sds/handlers/update-record.js";
import { uploadSdsPdf } from "./sds/handlers/upload-pdf.js";

export const sdsRouter = Router();

sdsRouter.get("/", requirePermission("sds:read"), listSdsRecords);
sdsRouter.get("/:id", requirePermission("sds:read"), getSdsRecord);
sdsRouter.post("/", requirePermission("sds:write"), createSdsRecord);
sdsRouter.put("/:id", requirePermission("sds:update"), updateSdsRecord);
sdsRouter.post("/:id/pdf", requirePermission("sds:update"), uploadSdsPdf);
sdsRouter.delete("/:id", requirePermission("sds:delete"), deleteSdsRecord);

