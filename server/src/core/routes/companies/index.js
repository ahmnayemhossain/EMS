import { Router } from "express";

import { requirePermission } from "../../shared/permissions.js";
import {
  createCompany, deleteCompany, getCompany,
  listCompanies, listCompanyOptions, updateCompany,
} from "./handlers.js";

export const companiesRouter = Router();

companiesRouter.get("/", requirePermission("settings:companies:read"), listCompanies);
companiesRouter.get("/options", listCompanyOptions);
companiesRouter.get("/:id", requirePermission("settings:companies:read"), getCompany);
companiesRouter.post("/", requirePermission("settings:companies:write"), createCompany);
companiesRouter.put("/:id", requirePermission("settings:companies:update"), updateCompany);
companiesRouter.delete("/:id", requirePermission("settings:companies:delete"), deleteCompany);
