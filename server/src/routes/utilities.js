import { Router } from "express";

import { requirePermission } from "../shared/permissions.js";
import { createUtilityRecord } from "./utilities/handlers/create-record.js";
import { deleteUtilityRecord } from "./utilities/handlers/delete-record.js";
import { getUtilityRecord } from "./utilities/handlers/get-record.js";
import { listUtilityRecords } from "./utilities/handlers/list-records.js";
import { listUtilitySourceOptions } from "./utilities/handlers/list-source-options.js";
import { listUtilityUomOptions } from "./utilities/handlers/list-uom-options.js";
import { updateUtilityRecord } from "./utilities/handlers/update-record.js";
import { uploadUtilityAttachment } from "./utilities/handlers/upload-attachment.js";

export const utilitiesRouter = Router();

utilitiesRouter.get("/uom-options", requirePermission("utilities:read"), listUtilityUomOptions);
utilitiesRouter.get("/source-options", requirePermission("utilities:read"), listUtilitySourceOptions);
utilitiesRouter.get("/", requirePermission("utilities:read"), listUtilityRecords);
utilitiesRouter.get("/:id", requirePermission("utilities:read"), getUtilityRecord);
utilitiesRouter.post("/", requirePermission("utilities:write"), createUtilityRecord);
utilitiesRouter.put("/:id", requirePermission("utilities:update"), updateUtilityRecord);
utilitiesRouter.post("/:id/attachment", requirePermission("utilities:update"), uploadUtilityAttachment);
utilitiesRouter.delete("/:id", requirePermission("utilities:delete"), deleteUtilityRecord);
