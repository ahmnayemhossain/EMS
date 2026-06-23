import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";

import { createWastewaterRecord } from "./wastewater/handlers/create-record.js";
import { deleteWastewaterRecord } from "./wastewater/handlers/delete-record.js";
import { getWastewaterRecord } from "./wastewater/handlers/get-record.js";
import { listWastewaterRecords } from "./wastewater/handlers/list-records.js";
import { updateWastewaterRecord } from "./wastewater/handlers/update-record.js";
import { uploadWastewaterLabReport } from "./wastewater/handlers/upload-report.js";

export const wastewaterRouter = Router();

wastewaterRouter.get("/", requirePermission("wastewater:read"), listWastewaterRecords);
wastewaterRouter.get("/:id", requirePermission("wastewater:read"), getWastewaterRecord);
wastewaterRouter.post("/", requirePermission("wastewater:write"), createWastewaterRecord);
wastewaterRouter.put("/:id", requirePermission("wastewater:update"), updateWastewaterRecord);
wastewaterRouter.post("/:id/lab-report", requirePermission("wastewater:update"), uploadWastewaterLabReport);
wastewaterRouter.delete("/:id", requirePermission("wastewater:delete"), deleteWastewaterRecord);
