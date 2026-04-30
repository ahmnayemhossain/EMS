import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import { createUser, deleteUser, getUser, listUserLookups, listUsers, resetUserPassword, updateUser } from "./handlers.js";

export const usersRouter = Router();

usersRouter.get("/lookups/options", listUserLookups);
usersRouter.get("/", requirePermission("settings:users:read"), listUsers);
usersRouter.get("/:id", requirePermission("settings:users:read"), getUser);
usersRouter.post("/", requirePermission("settings:users:write"), createUser);
usersRouter.put("/:id", requirePermission("settings:users:update"), updateUser);
usersRouter.post("/:id/reset-password", requirePermission("settings:users:update"), resetUserPassword);
usersRouter.delete("/:id", requirePermission("settings:users:delete"), deleteUser);
