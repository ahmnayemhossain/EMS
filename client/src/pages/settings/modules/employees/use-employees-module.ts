import * as React from "react";
import { toast } from "@/app/lib/toast";
import { useUser } from "@/app/state/user";
import { listEmployeeLookups, listEmployees, type EmployeeLookupOption } from "@/pages/settings/modules/employeesApi";
import type { Employee } from "@/types/admin";
import type { EmployeeLookups, EmployeeRow } from "@/pages/settings/modules/employees/employees.types";
import { createBlankEmployee } from "@/pages/settings/modules/employees/helpers";

export function useEmployeesModule() {
  const { userId } = useUser();
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [lookups, setLookups] = React.useState<EmployeeLookups>({ facilities: [], departments: [], designations: [] });
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<EmployeeRow | null>(null);
  const [editDraft, setEditDraft] = React.useState<Employee | null>(null);
  const [editErrors, setEditErrors] = React.useState({});
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createErrors, setCreateErrors] = React.useState({});
  const [draft, setDraft] = React.useState<Employee>(() => createBlankEmployee([], { facilities: [], departments: [], designations: [] }));

  const loadEmployees = React.useCallback(async () => {
    try {
      setLoading(true);
      const [nextEmployees, nextLookups] = await Promise.all([listEmployees(userId), listEmployeeLookups()]);
      setEmployees(nextEmployees);
      setLookups({ facilities: nextLookups.facilities as EmployeeLookupOption[], departments: nextLookups.departments as EmployeeLookupOption[], designations: nextLookups.designations as EmployeeLookupOption[] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load employees");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => { void loadEmployees(); }, [loadEmployees]);
  React.useEffect(() => { if (createOpen) { setDraft(createBlankEmployee(employees, lookups)); setCreateErrors({}); } }, [createOpen, employees, lookups]);

  const rows = React.useMemo(() => employees.filter((employee) => !companyId || employee.companyId === companyId).filter((employee) => !search.trim() || `${employee.name} ${employee.employeeId} ${employee.email} ${employee.phone ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => (a.employeeId > b.employeeId ? 1 : -1)), [companyId, employees, search]);
  return { userId, employees, lookups, loading, search, companyId, selected, editDraft, editErrors, confirmDelete, createOpen, createErrors, draft, rows, setEmployees, setSearch, setCompanyId, setSelected, setEditDraft, setEditErrors, setConfirmDelete, setCreateOpen, setCreateErrors, setDraft, loadEmployees };
}
