import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";

import { createWasteRecord } from "./waste/handlers/create-record.js";
import { deleteWasteRecord } from "./waste/handlers/delete-record.js";
import { getWasteRecord } from "./waste/handlers/get-record.js";
import { listWasteRecords } from "./waste/handlers/list-records.js";
import { updateWasteRecord } from "./waste/handlers/update-record.js";
import { uploadWasteAttachment } from "./waste/handlers/upload-attachment.js";

export const wasteRouter = Router();

wasteRouter.get("/", requirePermission("waste:read"), listWasteRecords);
wasteRouter.get("/:id", requirePermission("waste:read"), getWasteRecord);
wasteRouter.post("/", requirePermission("waste:write"), createWasteRecord);
wasteRouter.put("/:id", requirePermission("waste:update"), updateWasteRecord);
wasteRouter.post("/:id/attachment", requirePermission("waste:update"), uploadWasteAttachment);
wasteRouter.delete("/:id", requirePermission("waste:delete"), deleteWasteRecord);
