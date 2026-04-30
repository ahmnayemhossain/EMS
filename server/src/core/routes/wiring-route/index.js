import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { createItem, deleteItem, listItems, listOptions, updateItem } from "./handlers.js";

export function createWiringRouter(config) {
  const router = Router();
  router.get("/lookups/options", requirePermission(`${config.permissionKey}:read`), listOptions(config));
  router.get("/", requirePermission(`${config.permissionKey}:read`), listItems(config));
  router.post("/", requirePermission(`${config.permissionKey}:write`), createItem(config));
  router.put("/:id", requirePermission(`${config.permissionKey}:update`), updateItem(config));
  router.delete("/:id", requirePermission(`${config.permissionKey}:delete`), deleteItem(config));
  return router;
}
