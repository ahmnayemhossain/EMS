import type { Employee } from "@/types/admin";
import type { EmployeeLookupOption } from "@/pages/settings/modules/employeesApi";

export type EmployeeRow = Employee & {
  createdByUserName?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeLookups = {
  facilities: EmployeeLookupOption[];
  departments: EmployeeLookupOption[];
  designations: EmployeeLookupOption[];
};

export type EmployeeValidationErrors = Partial<Record<"employeeId" | "name" | "email" | "companyId" | "departmentId" | "designationId" | "status", string>>;
