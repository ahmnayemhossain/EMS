import type { Employee } from "@/core/types/admin";
import type { EmployeeLookups, EmployeeValidationErrors } from "@/core/settings/modules/employees/employees.types";
import type { EmployeeLookupOption } from "@/core/settings/modules/employeesApi";

export function getOptionName(options: EmployeeLookupOption[], id?: string) {
  if (!id) return "-";
  return options.find((option) => option.id === id)?.name ?? id;
}

export function formatEmployeeDate(value?: string) {
  return value ? value.slice(0, 10) : "-";
}

export function createBlankEmployee(employees: Employee[], lookups: EmployeeLookups): Employee {
  return { id: createId("emp"), name: "", employeeId: nextEmployeeId(employees), companyId: lookups.facilities[0]?.id ?? "", departmentId: lookups.departments[0]?.id ?? "", designationId: lookups.designations[0]?.id ?? "", status: 1, email: "", phone: "", joinedOn: "" };
}

export function normalizeEmployee(employee: Employee, lookups: EmployeeLookups): Employee {
  return { ...employee, employeeId: Number(employee.employeeId), department: getOptionName(lookups.departments, employee.departmentId), designation: getOptionName(lookups.designations, employee.designationId), phone: employee.phone?.trim() || undefined, joinedOn: employee.joinedOn?.trim() || undefined };
}

export function getEmployeeValidationErrors(employee: Employee, employees: Employee[], currentId?: string) {
  const errors: EmployeeValidationErrors = {};
  if (!Number.isFinite(employee.employeeId) || employee.employeeId <= 0) errors.employeeId = "Employee ID must be a number";
  else if (employees.some((row) => row.id !== currentId && row.employeeId === employee.employeeId)) errors.employeeId = "Employee ID already exists";
  if (!employee.name.trim()) errors.name = "Name is required";
  if (!employee.email.trim()) errors.email = "Email is required";
  else if (employees.some((row) => row.id !== currentId && row.email.toLowerCase() === employee.email.toLowerCase())) errors.email = "Email already exists";
  if (!employee.companyId) errors.companyId = "Company is required";
  if (!employee.departmentId) errors.departmentId = "Department is required";
  if (!employee.designationId) errors.designationId = "Designation is required";
  if (![0, 1].includes(Number(employee.status))) errors.status = "Status is required";
  return errors;
}

export function firstValidationMessage(errors: EmployeeValidationErrors) {
  return Object.values(errors)[0] ?? null;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
}

function nextEmployeeId(employees: Employee[]) {
  return employees.reduce((highest, employee) => Math.max(highest, Number(employee.employeeId) || 0), 1000) + 1;
}
