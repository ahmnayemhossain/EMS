import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import {
  createEmployee, deleteEmployee, getEmployee,
  listEmployeeLookups, listEmployees, updateEmployee,
} from "./handlers.js";

export const employeesRouter = Router();

employeesRouter.get("/lookups/options", listEmployeeLookups);
employeesRouter.get("/", requirePermission("settings:employees:read"), listEmployees);
employeesRouter.get("/:id", requirePermission("settings:employees:read"), getEmployee);
employeesRouter.post("/", requirePermission("settings:employees:write"), createEmployee);
employeesRouter.put("/:id", requirePermission("settings:employees:update"), updateEmployee);
employeesRouter.delete("/:id", requirePermission("settings:employees:delete"), deleteEmployee);
