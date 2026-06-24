import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { DataTable } from "@/components/table/DataTable";
import { useSelectedCompany } from "@/core/app/state/slices/company";

import { DocumentCreateDialog } from "@/features/assurance/documents/components/DocumentCreateDialog";
import { DocumentDetailPanel } from "@/features/assurance/documents/components/DocumentDetailPanel";
import { DocumentsKpis } from "@/features/assurance/documents/components/DocumentsKpis";
import { getDocumentColumns } from "@/features/assurance/documents/config/columns";
import { DOCUMENT_CATEGORIES } from "@/features/assurance/documents/config/constants";
import { useDocumentsPage } from "@/features/assurance/documents/hooks/use-documents-page";

export function DocumentsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const page = useDocumentsPage({
    companies,
    selectedCompanyId: selectedCompanyId || undefined,
  });
  const columns = getDocumentColumns();

  return (
    <div className="space-y-6">
      <FilterBar
        left={(
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={page.search} onChange={page.setSearch} placeholder="Search documents..." />
            </div>
            <SelectFilter
              value={page.companyFilter}
              onChange={(value) => page.setCompanyFilter(value ?? undefined)}
              placeholder="Company"
              items={companies.map((company) => ({ value: company.id, label: company.name }))}
            />
            <SelectFilter
              value={page.categoryFilter}
              onChange={(value) => page.setCategoryFilter(value ?? undefined)}
              placeholder="Category"
              items={DOCUMENT_CATEGORIES}
            />
          </div>
        )}
        onClear={page.clearFilters}
      />

      <DocumentsKpis
        total={page.metrics.total}
        expiring={page.metrics.expiring}
        expired={page.metrics.expired}
      />

      <DocumentCreateDialog
        companies={companies}
        open={page.createOpen}
        title={page.title}
        facilityId={page.facilityId}
        category={page.category}
        ownerDepartment={page.ownerDepartment}
        expiresOn={page.expiresOn}
        notes={page.notes}
        file={page.file}
        onOpenChange={(open) => {
          page.setCreateOpen(open);
          if (open) {
            page.resetCreateForm();
          }
        }}
        onTitleChange={page.setTitle}
        onFacilityIdChange={page.setFacilityId}
        onCategoryChange={page.setCategory}
        onOwnerDepartmentChange={page.setOwnerDepartment}
        onExpiresOnChange={page.setExpiresOn}
        onNotesChange={page.setNotes}
        onFileChange={page.setFile}
        onCreate={page.createRecord}
      />

      {page.loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Loading documents...</div>
      ) : (
        <DataTable rows={page.rows} columns={columns} rowKey={(row) => row.id} onRowClick={(row) => page.setSelected(row)} />
      )}

      <DocumentDetailPanel
        document={page.selected}
        open={Boolean(page.selected)}
        onOpenChange={(open) => {
          if (!open) {
            page.setSelected(null);
          }
        }}
        onDelete={page.removeRecord}
      />
    </div>
  );
}
