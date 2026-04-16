import type { AppUser, Employee, PermissionKey, Role } from "@/types/admin";
import { facilities } from "@/data/mock";

function pickFactoryId(i: number) {
  return facilities[i % facilities.length]?.id ?? facilities[0]?.id ?? "fac_hfl";
}

function isoDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function isoDateTime(hoursAgo: number) {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export const permissionCatalog: Array<{ key: PermissionKey; label: string }> = [
  { key: "dashboard:view", label: "View dashboard" },
  { key: "utilities:manage", label: "Manage utilities" },
  { key: "chemicals:manage", label: "Manage chemicals" },
  { key: "sds:manage", label: "Manage SDS" },
  { key: "waste:manage", label: "Manage waste" },
  { key: "wastewater:manage", label: "Manage wastewater / ETP" },
  { key: "audits:manage", label: "Manage audits" },
  { key: "capa:manage", label: "Manage CAPA" },
  { key: "documents:manage", label: "Manage documents" },
  { key: "complaints:triage", label: "Triage complaints" },
  { key: "complaints:handle", label: "Handle complaints" },
  { key: "settings:manage", label: "Manage settings" },
];

export const seedRoles: Role[] = [
  {
    id: "role_admin",
    name: "Admin",
    scope: "group",
    description: "Full access (recommended for IT / System admin).",
    permissionKeys: permissionCatalog.map((p) => p.key),
  },
  {
    id: "role_sustainability",
    name: "Sustainability",
    scope: "group",
    description: "Monitoring + compliance modules with limited admin.",
    permissionKeys: [
      "dashboard:view",
      "utilities:manage",
      "chemicals:manage",
      "sds:manage",
      "waste:manage",
      "wastewater:manage",
      "audits:manage",
      "capa:manage",
      "documents:manage",
      "complaints:triage",
    ],
  },
  {
    id: "role_supervisor",
    name: "Supervisor",
    scope: "factory",
    description: "Factory-level operations + complaint handling.",
    permissionKeys: [
      "dashboard:view",
      "utilities:manage",
      "chemicals:manage",
      "waste:manage",
      "wastewater:manage",
      "complaints:triage",
      "complaints:handle",
    ],
  },
  {
    id: "role_viewer",
    name: "Viewer",
    scope: "factory",
    description: "Read-only access (audit-ready view).",
    permissionKeys: ["dashboard:view"],
  },
];

export const seedEmployees: Employee[] = [
  {
    id: "emp_700901",
    name: "Nayem",
    employeeId: "700901",
    factoryId: pickFactoryId(0),
    department: "EHS",
    designation: "Officer",
    status: "active",
    joinedOn: isoDate(520),
  },
  {
    id: "emp_70900",
    name: "Mehedi",
    employeeId: "70900",
    factoryId: pickFactoryId(1),
    department: "Compliance",
    designation: "Executive",
    status: "active",
    joinedOn: isoDate(740),
  },
  {
    id: "emp_700999",
    name: "Nimur",
    employeeId: "700999",
    factoryId: pickFactoryId(2),
    department: "Utility",
    designation: "Engineer",
    status: "active",
    joinedOn: isoDate(410),
  },
  {
    id: "emp_700902",
    name: "Munna",
    employeeId: "700902",
    factoryId: pickFactoryId(3),
    department: "Admin",
    designation: "Supervisor",
    status: "active",
    joinedOn: isoDate(1020),
  },
  {
    id: "emp_700903",
    name: "Sakib",
    employeeId: "700903",
    factoryId: pickFactoryId(4),
    department: "Dyeing",
    designation: "Supervisor",
    status: "active",
    joinedOn: isoDate(860),
  },
  {
    id: "emp_700905",
    name: "Aminul",
    employeeId: "700905",
    factoryId: pickFactoryId(5),
    department: "Resort Ops",
    designation: "Manager",
    status: "active",
    joinedOn: isoDate(1200),
  },
  {
    id: "emp_700906",
    name: "Parvej",
    employeeId: "700906",
    factoryId: pickFactoryId(0),
    department: "Security",
    designation: "Officer",
    status: "inactive",
    joinedOn: isoDate(1600),
  },
  // Fill to ~20 rows so UI looks real
  ...Array.from({ length: 13 }).map((_, i) => {
    const n = i + 1;
    const employeeId = String(701100 + i);
    return {
      id: `emp_${employeeId}`,
      name: `Employee ${n}`,
      employeeId,
      factoryId: pickFactoryId(i),
      department: i % 2 ? "Production" : "Maintenance",
      designation: i % 3 ? "Assistant" : "Technician",
      status: i % 5 === 0 ? "inactive" : "active",
      joinedOn: isoDate(200 + i * 20),
    } satisfies Employee;
  }),
];

export const seedUsers: AppUser[] = [
  {
    id: "usr_nayem",
    employeeId: "700901",
    username: "nayem",
    email: "nayem@fortis.local",
    roleIds: ["role_admin"],
    status: "active",
    lastLoginAt: isoDateTime(4),
  },
  {
    id: "usr_mehedi",
    employeeId: "70900",
    username: "mehedi",
    email: "mehedi@fortis.local",
    roleIds: ["role_sustainability"],
    status: "active",
    lastLoginAt: isoDateTime(12),
  },
  {
    id: "usr_munna",
    employeeId: "700902",
    username: "munna",
    email: "munna@fortis.local",
    roleIds: ["role_supervisor"],
    status: "active",
    lastLoginAt: isoDateTime(30),
  },
  ...Array.from({ length: 17 }).map((_, i) => {
    const n = i + 1;
    const employeeId = String(701200 + i);
    return {
      id: `usr_${employeeId}`,
      employeeId,
      username: `user${n}`,
      email: `user${n}@fortis.local`,
      roleIds: [i % 3 === 0 ? "role_viewer" : "role_supervisor"],
      status: i % 7 === 0 ? "suspended" : "active",
      lastLoginAt: isoDateTime(24 + i * 3),
    } satisfies AppUser;
  }),
];

