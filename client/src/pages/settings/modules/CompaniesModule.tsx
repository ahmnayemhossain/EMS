import { RefreshCw } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SectionCard } from "@/components/SectionCard";
import { DeleteConfirm } from "@/pages/settings/modules/users/delete-confirm";
import { buildCompanyColumns } from "@/pages/settings/modules/companies/columns";
import { CompaniesDetailView } from "@/pages/settings/modules/companies/detail-view";
import { CompanyForm } from "@/pages/settings/modules/companies/form";
import { firstCompanyError, validateCompany } from "@/pages/settings/modules/companies/helpers";
import { useCompaniesModule } from "@/pages/settings/modules/companies/use-companies-module";
import { createCompany, deleteCompany, updateCompany } from "@/pages/settings/modules/companiesApi";

export function CompaniesModule() {
  const vm = useCompaniesModule();
  return <div className="space-y-4"><div className="flex items-center justify-end gap-2"><Button variant="outline" size="icon" onClick={() => void vm.loadCompanies()} disabled={vm.loading}><RefreshCw className="size-4" /></Button><CreateActionDialog title="Create company" triggerLabel="Create" submitLabel="Create" open={vm.createOpen} onOpenChange={vm.setCreateOpen} contentClassName="sm:max-w-2xl" onCreate={() => createNewCompany(vm)}><CompanyForm value={vm.draft} onChange={(company) => { vm.setDraft(company); if (Object.keys(vm.createErrors).length) vm.setCreateErrors({}); }} errors={vm.createErrors} /></CreateActionDialog></div><FilterBar left={<div className="w-full sm:w-[360px]"><SearchInput value={vm.search} onChange={vm.setSearch} placeholder="Search companies..." /></div>} onClear={() => vm.setSearch("")} /><SectionCard title="Companies" description="Company master data used by employees, users, dashboards, and operations.">{vm.loading ? <div className="p-4 text-sm text-muted-foreground">Loading companies from database...</div> : null}{!vm.loading && vm.rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No companies found.</div> : null}<DataTable rows={vm.rows} columns={buildCompanyColumns()} rowKey={(row) => row.id} onRowClick={(company) => { vm.setSelected(company); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} /></SectionCard><DetailPanel open={Boolean(vm.selected)} onOpenChange={(open) => { if (open) return; vm.setSelected(null); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} title={vm.editDraft ? "Edit company" : "Company"} description={vm.selected ? vm.selected.name : undefined} overlay={vm.selected && vm.confirmDelete ? <DeleteConfirm label={vm.selected.name} onCancel={() => vm.setConfirmDelete(false)} onConfirm={async () => { await deleteCompany(vm.selected!.id, vm.userId); vm.setConfirmDelete(false); vm.setEditDraft(null); vm.setSelected(null); toast.success("Deleted"); await vm.loadCompanies(); }} /> : null}>{vm.selected ? <CompaniesDetailView selected={vm.selected} draft={vm.editDraft} errors={vm.editErrors} onDraftChange={(company) => { vm.setEditDraft(company); if (Object.keys(vm.editErrors).length) vm.setEditErrors({}); }} onCancel={() => { vm.setEditDraft(null); vm.setEditErrors({}); }} onSave={() => void saveEdit(vm)} onDelete={() => vm.setConfirmDelete(true)} onEdit={() => { vm.setEditDraft({ ...vm.selected! }); vm.setEditErrors({}); }} /> : null}</DetailPanel></div>;
}

async function createNewCompany(vm: ReturnType<typeof useCompaniesModule>) {
  const errors = validateCompany(vm.draft, vm.companies);
  vm.setCreateErrors(errors);
  const message = firstCompanyError(errors);
  if (message) return toast.error(message), false;
  try { const created = await createCompany(vm.draft, vm.userId); vm.setCompanies((rows) => [created, ...rows]); vm.setCreateErrors({}); toast.success("Company created"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Company create failed"); return false; }
}

async function saveEdit(vm: ReturnType<typeof useCompaniesModule>) {
  if (!vm.selected || !vm.editDraft) return;
  const errors = validateCompany(vm.editDraft, vm.companies, vm.selected.id);
  vm.setEditErrors(errors);
  const message = firstCompanyError(errors);
  if (message) return toast.error(message);
  try { const updated = await updateCompany(vm.editDraft, vm.userId); vm.setSelected(updated); vm.setEditDraft(null); vm.setEditErrors({}); toast.success("Saved"); await vm.loadCompanies(); } catch (error) { toast.error(error instanceof Error ? error.message : "Company save failed"); }
}
