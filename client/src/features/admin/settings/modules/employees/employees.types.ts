import type { Employee } from "@/core/types/models/admin";
import type { EmployeeLookupOption } from "@/features/admin/settings/modules/services/employeesApi";

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

