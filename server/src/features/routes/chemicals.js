import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";
import { createChemical } from "./chemicals/handlers/create-chemical.js";
import { deleteChemical } from "./chemicals/handlers/delete-chemical.js";
import { getChemical } from "./chemicals/handlers/get-chemical.js";
import { listChemicals } from "./chemicals/handlers/list-chemicals.js";
import { updateChemical } from "./chemicals/handlers/update-chemical.js";

export const chemicalsRouter = Router();

chemicalsRouter.get("/", requirePermission("chemicals:read"), listChemicals);
chemicalsRouter.get("/:id", requirePermission("chemicals:read"), getChemical);
chemicalsRouter.post("/", requirePermission("chemicals:write"), createChemical);
chemicalsRouter.put("/:id", requirePermission("chemicals:update"), updateChemical);
chemicalsRouter.delete("/:id", requirePermission("chemicals:delete"), deleteChemical);

