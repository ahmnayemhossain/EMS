import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { allowed } from "./config.js";
import { createItem, deleteItem, listItems, updateItem } from "./handlers.js";

export function createReferenceSettingsRouter(tableName) {
  const config = allowed[tableName];
  if (!config) throw new Error(`Unsupported reference table: ${tableName}`);
  const router = Router();
  router.get("/", requirePermission(`settings:${tableName}:read`), listItems(tableName));
  router.post("/", requirePermission(`settings:${tableName}:write`), createItem(tableName, config.label));
  router.put("/:id", requirePermission(`settings:${tableName}:update`), updateItem(tableName, config.label));
  router.delete("/:id", requirePermission(`settings:${tableName}:delete`), deleteItem(tableName, config.label));
  return router;
}
