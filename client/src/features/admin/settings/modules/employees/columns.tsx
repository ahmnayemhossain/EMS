import type { DataColumn } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { AvatarInitials } from "@/features/admin/settings/modules/users/avatar-initials";
import { getOptionName } from "@/features/admin/settings/modules/employees/helpers";
import type { EmployeeRow } from "@/features/admin/settings/modules/employees/employees.types";
import type { EmployeeLookupOption } from "@/features/admin/settings/modules/services/employeesApi";

export function buildEmployeeColumns(lookups: {
  facilities: EmployeeLookupOption[];
  departments: EmployeeLookupOption[];
  designations: EmployeeLookupOption[];
}): Array<DataColumn<EmployeeRow>> {
  return [
    { id: "name", header: "Employee", cell: (employee) => <div className="flex min-w-0 items-center gap-3"><AvatarInitials label={employee.name} /><div className="min-w-0"><div className="truncate text-sm font-medium">{employee.name}</div><div className="mt-0.5 text-xs text-muted-foreground">ID {employee.employeeId} - {getOptionName(lookups.departments, employee.departmentId)}</div></div></div> },
    { id: "company", header: "Company", cell: (employee) => <div className="text-sm">{getOptionName(lookups.facilities, employee.companyId)}</div>, className: "hidden lg:table-cell" },
    { id: "designation", header: "Designation", cell: (employee) => <div className="text-sm">{getOptionName(lookups.designations, employee.designationId)}</div>, className: "hidden xl:table-cell" },
    { id: "status", header: "Status", cell: (employee) => <StatusBadge tone={employee.status === 1 ? "compliant" : "neutral"}>{employee.status === 1 ? "active" : "inactive"}</StatusBadge>, className: "text-right" },
  ];
}


