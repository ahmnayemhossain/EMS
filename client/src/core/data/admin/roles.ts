import type { Role } from "@/core/types/models/admin";

import { permissionCatalog } from "./permissions";

export const seedRoles: Role[] = [
  { id: "role_admin", name: "Admin", scope: "group", description: "Full access (recommended for IT / System admin).", permissionKeys: permissionCatalog.map((p) => p.key) },
  { id: "role_sustainability", name: "Sustainability", scope: "group", description: "Monitoring + compliance modules with limited admin.", permissionKeys: ["dashboard:read", "utilities:read", "utilities:write", "utilities:update", "chemicals:read", "chemicals:write", "chemicals:update", "sds:read", "sds:write", "sds:update", "waste:read", "waste:write", "waste:update", "wastewater:read", "wastewater:write", "wastewater:update", "audits:read", "audits:write", "audits:update", "capa:read", "capa:write", "capa:update", "documents:read", "documents:write", "documents:update", "complaints:triage"] },
  { id: "role_supervisor", name: "Supervisor", scope: "company", description: "Company-level operations + complaint handling.", permissionKeys: ["dashboard:read", "utilities:read", "utilities:write", "utilities:update", "chemicals:read", "chemicals:write", "chemicals:update", "waste:read", "waste:write", "waste:update", "wastewater:read", "wastewater:write", "wastewater:update", "complaints:triage", "complaints:handle"] },
  { id: "role_viewer", name: "Viewer", scope: "company", description: "Read-only access (audit-ready view).", permissionKeys: ["dashboard:read"] },
];
