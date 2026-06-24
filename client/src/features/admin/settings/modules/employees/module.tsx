import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DataTable } from "@/components/table/DataTable";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { toast } from "@/core/app/lib/toast";
import { buildEmployeeColumns } from "@/features/admin/settings/modules/employees/columns";
import { EmployeesDetailView } from "@/features/admin/settings/modules/employees/detail-view";
import { EmployeeForm } from "@/features/admin/settings/modules/employees/form";
import {
  firstValidationMessage,
  getEmployeeValidationErrors,
  normalizeEmployee,
} from "@/features/admin/settings/modules/employees/helpers";
import { useEmployeesModule } from "@/features/admin/settings/modules/employees/use-employees-module";
import { createEmployee, deleteEmployee, updateEmployee } from "@/features/admin/settings/modules/services/employeesApi";
import { DeleteConfirm } from "@/features/admin/settings/modules/users/delete-confirm";

type EmployeesModuleVm = ReturnType<typeof useEmployeesModule>;

export function EmployeesModule() {
  const vm = useEmployeesModule();
  const columns = buildEmployeeColumns(vm.lookups);

  return (
    <div className="space-y-4">
      <EmployeesActionsBar vm={vm} />
      <EmployeesFilters vm={vm} />
      <EmployeesTable vm={vm} columns={columns} />
      <EmployeesDetailPanel vm={vm} />
    </div>
  );
}

function EmployeesActionsBar(props: { vm: EmployeesModuleVm }) {
  const { vm } = props;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => void vm.loadEmployees()}
        disabled={vm.loading}
      >
        <RefreshCw className="size-4" />
      </Button>
      <CreateActionDialog
        title="Create employee"
        triggerLabel="Create employee"
        triggerVariant="floating"
        submitLabel="Create"
        open={vm.createOpen}
        onOpenChange={vm.setCreateOpen}
        contentClassName="sm:max-w-2xl"
        onCreate={() => createNewEmployee(vm)}
      >
        <EmployeeForm
          value={vm.draft}
          onChange={(employee) => {
            vm.setDraft(employee);
            if (Object.keys(vm.createErrors).length) {
              vm.setCreateErrors({});
            }
          }}
          lookups={vm.lookups}
          errors={vm.createErrors}
        />
      </CreateActionDialog>
    </div>
  );
}

function EmployeesFilters(props: { vm: EmployeesModuleVm }) {
  const { vm } = props;

  return (
    <FilterBar
      left={(
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[360px]">
            <SearchInput
              value={vm.search}
              onChange={vm.setSearch}
              placeholder="Search employees..."
            />
          </div>
          <SelectFilter
            value={vm.companyId}
            onChange={vm.setCompanyId}
            placeholder="Company"
            items={vm.lookups.facilities.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
        </div>
      )}
      onClear={() => {
        vm.setSearch("");
        vm.setCompanyId(undefined);
      }}
    />
  );
}

function EmployeesTable(props: {
  vm: EmployeesModuleVm;
  columns: ReturnType<typeof buildEmployeeColumns>;
}) {
  const { vm, columns } = props;

  return (
    <SectionCard
      title="Employees"
      description="Directory used by Users and ownership fields across the EMS."
    >
      {vm.loading ? (
        <div className="p-4 text-sm text-muted-foreground">
          Loading employees from database...
        </div>
      ) : null}
      {!vm.loading && vm.rows.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No employees found in database.
        </div>
      ) : null}
      <DataTable
        rows={vm.rows}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={(employee) => {
          vm.setSelected(employee);
          vm.setEditDraft(null);
          vm.setEditErrors({});
          vm.setConfirmDelete(false);
        }}
      />
    </SectionCard>
  );
}

function EmployeesDetailPanel(props: { vm: EmployeesModuleVm }) {
  const { vm } = props;
  const selected = vm.selected;

  return (
    <DetailPanel
      open={Boolean(selected)}
      onOpenChange={(open) => {
        if (open) return;
        vm.setSelected(null);
        vm.setEditDraft(null);
        vm.setEditErrors({});
        vm.setConfirmDelete(false);
      }}
      title={vm.editDraft ? "Edit employee" : "Employee"}
      description={selected ? `ID ${selected.employeeId}` : undefined}
      overlay={selected && vm.confirmDelete ? (
        <DeleteConfirm
          label={selected.name}
          onCancel={() => vm.setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteEmployee(selected.id, vm.userId);
            vm.setConfirmDelete(false);
            vm.setEditDraft(null);
            vm.setSelected(null);
            toast.success("Deleted");
            await vm.loadEmployees();
          }}
        />
      ) : null}
    >
      {selected ? (
        <EmployeesDetailView
          selected={selected}
          draft={vm.editDraft}
          lookups={vm.lookups}
          errors={vm.editErrors}
          onDraftChange={(employee) => {
            vm.setEditDraft(employee);
            if (Object.keys(vm.editErrors).length) {
              vm.setEditErrors({});
            }
          }}
          onCancel={() => {
            vm.setEditDraft(null);
            vm.setEditErrors({});
          }}
          onSave={() => void saveEdit(vm)}
          onDelete={() => vm.setConfirmDelete(true)}
          onEdit={() => {
            vm.setEditDraft({ ...selected });
            vm.setEditErrors({});
          }}
        />
      ) : null}
    </DetailPanel>
  );
}

async function createNewEmployee(vm: EmployeesModuleVm) {
  const employee = normalizeEmployee(vm.draft, vm.lookups);
  const errors = getEmployeeValidationErrors(employee, vm.employees);
  vm.setCreateErrors(errors);

  const validation = firstValidationMessage(errors);
  if (validation) {
    toast.error(validation);
    return false;
  }

  try {
    const created = await createEmployee(employee, vm.userId);
    vm.setEmployees((rows) => [created, ...rows]);
    vm.setCreateErrors({});
    toast.success("Employee created");
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Employee create failed");
    return false;
  }
}

async function saveEdit(vm: EmployeesModuleVm) {
  if (!vm.editDraft || !vm.selected) return;

  const employee = normalizeEmployee(vm.editDraft, vm.lookups);
  const errors = getEmployeeValidationErrors(employee, vm.employees, vm.selected.id);
  vm.setEditErrors(errors);

  const validation = firstValidationMessage(errors);
  if (validation) {
    toast.error(validation);
    return;
  }

  try {
    const updated = await updateEmployee(employee, vm.userId);
    vm.setSelected(updated);
    vm.setEditDraft(null);
    vm.setEditErrors({});
    toast.success("Saved");
    await vm.loadEmployees();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Employee save failed");
  }
}
