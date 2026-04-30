export const seedDepartments = [
  { id: "dept_ehs", name: "EHS" }, { id: "dept_compliance", name: "Compliance" }, { id: "dept_utility", name: "Utility" },
  { id: "dept_admin", name: "Admin" }, { id: "dept_production", name: "Production" }, { id: "dept_maintenance", name: "Maintenance" },
];

export const seedDesignations = [
  { id: "desig_officer", name: "Officer" }, { id: "desig_executive", name: "Executive" }, { id: "desig_engineer", name: "Engineer" },
  { id: "desig_supervisor", name: "Supervisor" }, { id: "desig_manager", name: "Manager" }, { id: "desig_technician", name: "Technician" },
];

export function departmentName(id: string) {
  return seedDepartments.find((department) => department.id === id)?.name ?? id;
}

export function designationName(id: string) {
  return seedDesignations.find((designation) => designation.id === id)?.name ?? id;
}
