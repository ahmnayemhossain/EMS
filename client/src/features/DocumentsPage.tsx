import { DataTable } from "@/core/components/DataTable";
import { PageHeader } from "@/core/components/PageHeader";

import { DocumentsActions } from "./documents/DocumentsActions";
import { getDocumentColumns } from "./documents/document-columns";
import { DocumentsFilters } from "./documents/DocumentsFilters";
import { useDocumentsPage } from "./documents/use-documents-page";

export function DocumentsPage() {
  const page = useDocumentsPage();
  return (
    <div className="space-y-6">
      <PageHeader title="Documents" actions={<DocumentsActions />} />
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
