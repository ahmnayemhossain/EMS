import { DataTable } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/primitives/PageHeader";

import { DocumentsActions } from './DocumentsActions';
import { getDocumentColumns } from './document-columns';
import { DocumentsFilters } from './DocumentsFilters';
import { useDocumentsPage } from './use-documents-page';

export function DocumentsPage() {
  const page = useDocumentsPage();
  return (
    <div className="space-y-6">
      <PageHeader actions={<DocumentsActions />} />
      <DocumentsFilters
        search={page.search}
        setSearch={page.setSearch}
        facilityId={page.facilityId}
        setFacilityId={page.setFacilityId}
        clear={() => {
          page.setSearch("");
          page.setFacilityId(undefined);
        }}
      />
      <DataTable rows={page.rows} columns={getDocumentColumns()} rowKey={(item) => item.id} />
    </div>
  );
}

