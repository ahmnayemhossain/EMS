import { Router } from "express";

import { requirePermission } from "../../core/shared/permissions.js";

import { createCapaRecord } from "./capa/handlers/create-capa.js";
import { deleteCapaRecord } from "./capa/handlers/delete-capa.js";
import { dismissCapaRecord } from "./capa/handlers/dismiss-capa.js";
import { listCapaRecords } from "./capa/handlers/list-capa.js";
import { moveCapaRecord } from "./capa/handlers/move-capa.js";
import { updateCapaRecord } from "./capa/handlers/update-capa.js";

export const capaRouter = Router();

capaRouter.get("/", requirePermission("capa:read"), listCapaRecords);
capaRouter.post("/", requirePermission("capa:write"), createCapaRecord);
capaRouter.put("/:id", requirePermission("capa:update"), updateCapaRecord);
capaRouter.patch("/:id/move", requirePermission("capa:update"), moveCapaRecord);
capaRouter.patch("/:id/dismiss", requirePermission("capa:update"), dismissCapaRecord);
capaRouter.delete("/:id", requirePermission("capa:delete"), deleteCapaRecord);
