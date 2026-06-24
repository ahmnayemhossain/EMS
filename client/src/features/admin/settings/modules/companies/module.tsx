import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DataTable } from "@/components/table/DataTable";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { toast } from "@/core/app/lib/toast";
import { buildCompanyColumns } from "@/features/admin/settings/modules/companies/columns";
import { CompaniesDetailView } from "@/features/admin/settings/modules/companies/detail-view";
import { CompanyForm } from "@/features/admin/settings/modules/companies/form";
import { firstCompanyError, validateCompany } from "@/features/admin/settings/modules/companies/helpers";
import { useCompaniesModule } from "@/features/admin/settings/modules/companies/use-companies-module";
import { createCompany, deleteCompany, updateCompany } from "@/features/admin/settings/modules/services/companiesApi";
import { DeleteConfirm } from "@/features/admin/settings/modules/users/delete-confirm";

type CompaniesModuleVm = ReturnType<typeof useCompaniesModule>;

export function CompaniesModule() {
  const vm = useCompaniesModule();

  return (
    <div className="space-y-4">
      <CompaniesActionsBar vm={vm} />
      <CompaniesFilters vm={vm} />
      <CompaniesTable vm={vm} />
      <CompaniesDetailPanel vm={vm} />
    </div>
  );
}

function CompaniesActionsBar(props: { vm: CompaniesModuleVm }) {
  const { vm } = props;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => void vm.loadCompanies()}
        disabled={vm.loading}
      >
        <RefreshCw className="size-4" />
      </Button>
      <CreateActionDialog
        title="Create company"
        triggerLabel="Create company"
        triggerVariant="floating"
        submitLabel="Create"
        open={vm.createOpen}
        onOpenChange={vm.setCreateOpen}
        contentClassName="sm:max-w-2xl"
        onCreate={() => createNewCompany(vm)}
      >
        <CompanyForm
          value={vm.draft}
          onChange={(company) => {
            vm.setDraft(company);
            if (Object.keys(vm.createErrors).length) {
              vm.setCreateErrors({});
            }
          }}
          errors={vm.createErrors}
        />
      </CreateActionDialog>
    </div>
  );
}

function CompaniesFilters(props: { vm: CompaniesModuleVm }) {
  const { vm } = props;

  return (
    <FilterBar
      left={(
        <div className="w-full sm:w-[360px]">
          <SearchInput
            value={vm.search}
            onChange={vm.setSearch}
            placeholder="Search companies..."
          />
        </div>
      )}
      onClear={() => vm.setSearch("")}
    />
  );
}

function CompaniesTable(props: { vm: CompaniesModuleVm }) {
  const { vm } = props;

  return (
    <SectionCard
      title="Companies"
      description="Company master data used by employees, users, and operations."
    >
      {vm.loading ? (
        <div className="p-4 text-sm text-muted-foreground">
          Loading companies from database...
        </div>
      ) : null}
      {!vm.loading && vm.rows.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No companies found.
        </div>
      ) : null}
      <DataTable
        rows={vm.rows}
        columns={buildCompanyColumns()}
        rowKey={(row) => row.id}
        onRowClick={(company) => {
          vm.setSelected(company);
          vm.setEditDraft(null);
          vm.setEditErrors({});
          vm.setConfirmDelete(false);
        }}
      />
    </SectionCard>
  );
}

function CompaniesDetailPanel(props: { vm: CompaniesModuleVm }) {
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
      title={vm.editDraft ? "Edit company" : "Company"}
      description={selected?.name}
      overlay={selected && vm.confirmDelete ? (
        <DeleteConfirm
          label={selected.name}
          onCancel={() => vm.setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteCompany(selected.id, vm.userId);
            vm.setConfirmDelete(false);
            vm.setEditDraft(null);
            vm.setSelected(null);
            toast.success("Deleted");
            await vm.loadCompanies();
          }}
        />
      ) : null}
    >
      {selected ? (
        <CompaniesDetailView
          selected={selected}
          draft={vm.editDraft}
          errors={vm.editErrors}
          onDraftChange={(company) => {
            vm.setEditDraft(company);
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

async function createNewCompany(vm: CompaniesModuleVm) {
  const errors = validateCompany(vm.draft, vm.companies);
  vm.setCreateErrors(errors);

  const message = firstCompanyError(errors);
  if (message) {
    toast.error(message);
    return false;
  }

  try {
    const created = await createCompany(vm.draft, vm.userId);
    vm.setCompanies((rows) => [created, ...rows]);
    vm.setCreateErrors({});
    toast.success("Company created");
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Company create failed");
    return false;
  }
}

async function saveEdit(vm: CompaniesModuleVm) {
  if (!vm.selected || !vm.editDraft) return;

  const errors = validateCompany(vm.editDraft, vm.companies, vm.selected.id);
  vm.setEditErrors(errors);

  const message = firstCompanyError(errors);
  if (message) {
    toast.error(message);
    return;
  }

  try {
    const updated = await updateCompany(vm.editDraft, vm.userId);
    vm.setSelected(updated);
    vm.setEditDraft(null);
    vm.setEditErrors({});
    toast.success("Saved");
    await vm.loadCompanies();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Company save failed");
  }
}
