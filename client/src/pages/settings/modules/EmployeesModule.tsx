import { RefreshCw } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SectionCard } from "@/components/SectionCard";
import { SelectFilter } from "@/components/SelectFilter";
import { DeleteConfirm } from "@/pages/settings/modules/users/delete-confirm";
import { buildEmployeeColumns } from "@/pages/settings/modules/employees/columns";
import { EmployeesDetailView } from "@/pages/settings/modules/employees/detail-view";
import { EmployeeForm } from "@/pages/settings/modules/employees/form";
import { firstValidationMessage, getEmployeeValidationErrors, normalizeEmployee } from "@/pages/settings/modules/employees/helpers";
import { useEmployeesModule } from "@/pages/settings/modules/employees/use-employees-module";
import { createEmployee, deleteEmployee, updateEmployee } from "@/pages/settings/modules/employeesApi";

export function EmployeesModule() {
  const vm = useEmployeesModule();
  const columns = buildEmployeeColumns(vm.lookups);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void vm.loadEmployees()} disabled={vm.loading}><RefreshCw className="size-4" /></Button>
        <CreateActionDialog title="Create employee" triggerLabel="Create" submitLabel="Create" open={vm.createOpen} onOpenChange={vm.setCreateOpen} contentClassName="sm:max-w-2xl" onCreate={() => createNewEmployee(vm)}>
          <EmployeeForm value={vm.draft} onChange={(employee) => { vm.setDraft(employee); if (Object.keys(vm.createErrors).length) vm.setCreateErrors({}); }} lookups={vm.lookups} errors={vm.createErrors} />
        </CreateActionDialog>
      </div>
      <FilterBar left={<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"><div className="w-full sm:w-[360px]"><SearchInput value={vm.search} onChange={vm.setSearch} placeholder="Search employees..." /></div><SelectFilter value={vm.companyId} onChange={vm.setCompanyId} placeholder="Company" items={vm.lookups.facilities.map((item) => ({ value: item.id, label: item.name }))} /></div>} onClear={() => { vm.setSearch(""); vm.setCompanyId(undefined); }} />
      <SectionCard title="Employees" description="Directory used by Users and ownership fields across the EMS.">
        {vm.loading ? <div className="p-4 text-sm text-muted-foreground">Loading employees from database...</div> : null}
        {!vm.loading && vm.rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No employees found in database.</div> : null}
        <DataTable rows={vm.rows} columns={columns} rowKey={(row) => row.id} onRowClick={(employee) => { vm.setSelected(employee); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} />
      </SectionCard>
      <DetailPanel open={Boolean(vm.selected)} onOpenChange={(open) => { if (open) return; vm.setSelected(null); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} title={vm.editDraft ? "Edit employee" : "Employee"} description={vm.selected ? `ID ${vm.selected.employeeId}` : undefined} overlay={vm.selected && vm.confirmDelete ? <DeleteConfirm label={vm.selected.name} onCancel={() => vm.setConfirmDelete(false)} onConfirm={async () => { await deleteEmployee(vm.selected!.id, vm.userId); vm.setConfirmDelete(false); vm.setEditDraft(null); vm.setSelected(null); toast.success("Deleted"); await vm.loadEmployees(); }} /> : null}>
        {vm.selected ? <EmployeesDetailView selected={vm.selected} draft={vm.editDraft} lookups={vm.lookups} errors={vm.editErrors} onDraftChange={(employee) => { vm.setEditDraft(employee); if (Object.keys(vm.editErrors).length) vm.setEditErrors({}); }} onCancel={() => { vm.setEditDraft(null); vm.setEditErrors({}); }} onSave={() => void saveEdit(vm)} onDelete={() => vm.setConfirmDelete(true)} onEdit={() => { vm.setEditDraft({ ...vm.selected! }); vm.setEditErrors({}); }} /> : null}
      </DetailPanel>
    </div>
  );
}

async function createNewEmployee(vm: ReturnType<typeof useEmployeesModule>) {
  const employee = normalizeEmployee(vm.draft, vm.lookups);
  const errors = getEmployeeValidationErrors(employee, vm.employees);
  vm.setCreateErrors(errors);
  const validation = firstValidationMessage(errors);
  if (validation) return toast.error(validation), false;
  try { const created = await createEmployee(employee, vm.userId); vm.setEmployees((rows) => [created, ...rows]); vm.setCreateErrors({}); toast.success("Employee created"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Employee create failed"); return false; }
}

async function saveEdit(vm: ReturnType<typeof useEmployeesModule>) {
  if (!vm.editDraft || !vm.selected) return;
  const employee = normalizeEmployee(vm.editDraft, vm.lookups);
  const errors = getEmployeeValidationErrors(employee, vm.employees, vm.selected.id);
  vm.setEditErrors(errors);
  const validation = firstValidationMessage(errors);
  if (validation) return toast.error(validation);
  try { const updated = await updateEmployee(employee, vm.userId); vm.setSelected(updated); vm.setEditDraft(null); vm.setEditErrors({}); toast.success("Saved"); await vm.loadEmployees(); } catch (error) { toast.error(error instanceof Error ? error.message : "Employee save failed"); }
}
