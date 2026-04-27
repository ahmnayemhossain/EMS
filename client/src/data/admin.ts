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

export const seedDepartments = [
  { id: "dept_ehs", name: "EHS" },
  { id: "dept_compliance", name: "Compliance" },
  { id: "dept_utility", name: "Utility" },
  { id: "dept_admin", name: "Admin" },
  { id: "dept_production", name: "Production" },
  { id: "dept_maintenance", name: "Maintenance" },
];

export const seedDesignations = [
  { id: "desig_officer", name: "Officer" },
  { id: "desig_executive", name: "Executive" },
  { id: "desig_engineer", name: "Engineer" },
  { id: "desig_supervisor", name: "Supervisor" },
  { id: "desig_manager", name: "Manager" },
  { id: "desig_technician", name: "Technician" },
];

function departmentName(id: string) {
  return seedDepartments.find((department) => department.id === id)?.name ?? id;
}

function designationName(id: string) {
  return seedDesignations.find((designation) => designation.id === id)?.name ?? id;
}

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
    id: "emp_EMP-0001",
    name: "User One",
    employeeId: 1001,
    factoryId: pickFactoryId(0),
    departmentId: "dept_ehs",
    designationId: "desig_officer",
    department: departmentName("dept_ehs"),
    designation: designationName("desig_officer"),
    status: 1,
    email: "userone@example.test",
    joinedOn: isoDate(520),
  },
  {
    id: "emp_EMP-0002",
    name: "User Two",
    employeeId: 1002,
    factoryId: pickFactoryId(1),
    departmentId: "dept_compliance",
    designationId: "desig_executive",
    department: departmentName("dept_compliance"),
    designation: designationName("desig_executive"),
    status: 1,
    email: "usertwo@example.test",
    joinedOn: isoDate(740),
  },
  {
    id: "emp_EMP-0003",
    name: "User Three",
    employeeId: 1003,
    factoryId: pickFactoryId(2),
    departmentId: "dept_utility",
    designationId: "desig_engineer",
    department: departmentName("dept_utility"),
    designation: designationName("desig_engineer"),
    status: 1,
    email: "userthree@example.test",
    joinedOn: isoDate(410),
  },
  {
    id: "emp_EMP-0004",
    name: "User Four",
    employeeId: 1004,
    factoryId: pickFactoryId(3),
    departmentId: "dept_admin",
    designationId: "desig_supervisor",
    department: departmentName("dept_admin"),
    designation: designationName("desig_supervisor"),
    status: 1,
    email: "userfour@example.test",
    joinedOn: isoDate(1020),
  },
  {
    id: "emp_EMP-0005",
    name: "User Five",
    employeeId: 1005,
    factoryId: pickFactoryId(4),
    departmentId: "dept_production",
    designationId: "desig_supervisor",
    department: departmentName("dept_production"),
    designation: designationName("desig_supervisor"),
    status: 1,
    email: "userfive@example.test",
    joinedOn: isoDate(860),
  },
  {
    id: "emp_EMP-0006",
    name: "User Six",
    employeeId: 1006,
    factoryId: pickFactoryId(5),
    departmentId: "dept_admin",
    designationId: "desig_manager",
    department: departmentName("dept_admin"),
    designation: designationName("desig_manager"),
    status: 1,
    email: "usersix@example.test",
    joinedOn: isoDate(1200),
  },
  {
    id: "emp_EMP-0007",
    name: "User Seven",
    employeeId: 1007,
    factoryId: pickFactoryId(0),
    departmentId: "dept_admin",
    designationId: "desig_officer",
    department: departmentName("dept_admin"),
    designation: designationName("desig_officer"),
    status: 0,
    email: "userseven@example.test",
    joinedOn: isoDate(1600),
  },
  // Fill to ~20 rows so UI looks real
  ...Array.from({ length: 13 }).map((_, i) => {
    const n = i + 1;
    const employeeId = 2000 + i + 1;
    const departmentId = i % 2 ? "dept_production" : "dept_maintenance";
    const designationId = i % 3 ? "desig_officer" : "desig_technician";
    return {
      id: `emp_${employeeId}`,
      name: `Employee ${n}`,
      employeeId,
      factoryId: pickFactoryId(i),
      departmentId,
      designationId,
      department: departmentName(departmentId),
      designation: designationName(designationId),
      status: i % 5 === 0 ? 0 : 1,
      email: `employee${n}@example.test`,
      joinedOn: isoDate(200 + i * 20),
    } satisfies Employee;
  }),
];

export const seedUsers: AppUser[] = [
  {
    id: "usr_userone",
    employeeId: 1001,
    username: "userone",
    email: "userone@example.test",
    roleIds: ["role_admin"],
    status: "active",
    lastLoginAt: isoDateTime(4),
  },
  {
    id: "usr_usertwo",
    employeeId: 1002,
    username: "usertwo",
    email: "usertwo@example.test",
    roleIds: ["role_sustainability"],
    status: "active",
    lastLoginAt: isoDateTime(12),
  },
  {
    id: "usr_userfour",
    employeeId: 1004,
    username: "userfour",
    email: "userfour@example.test",
    roleIds: ["role_supervisor"],
    status: "active",
    lastLoginAt: isoDateTime(30),
  },
  ...Array.from({ length: 17 }).map((_, i) => {
    const n = i + 1;
    const employeeId = 3000 + i + 1;
    return {
      id: `usr_${employeeId}`,
      employeeId,
      username: `user${n}`,
      email: `user${n}@example.test`,
      roleIds: [i % 3 === 0 ? "role_viewer" : "role_supervisor"],
      status: i % 7 === 0 ? "suspended" : "active",
      lastLoginAt: isoDateTime(24 + i * 3),
    } satisfies AppUser;
  }),
];
