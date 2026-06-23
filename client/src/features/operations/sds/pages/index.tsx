import { SdsCreateDialog } from "./SdsCreateDialog";
import { SdsDrawer } from "./SdsDrawer";
import { SdsEditDialog } from "./SdsEditDialog";
import { SdsImportValidationDialog } from "./SdsImportValidationDialog";
import { SdsListCard } from "./SdsListCard";
import { useSdsPage } from "../hooks/use-sds-page";

export function SdsPage() {
  const page = useSdsPage();

  return (
    <div className="space-y-6">
      <SdsCreateDialog
        open={page.createOpen}
        onOpenChange={page.setCreateOpen}
        createMeta={page.createMeta}
        setCreateMeta={page.setCreateMeta}
        createFile={page.createFile}
        setCreateFile={page.setCreateFile}
        createTab={page.createTab}
        setCreateTab={page.setCreateTab}
        createDraftBySectionId={page.createDraftBySectionId}
        setCreateDraftBySectionId={page.setCreateDraftBySectionId}
        createErrors={page.createErrors}
        sectionTitleById={page.sectionTitleById}
        onCreate={page.createRecord}
      />

      <SdsListCard
        suppliers={page.suppliers}
        latestRevision={page.latestRevision}
        search={page.search}
        setSearch={page.setSearch}
        filtered={page.filtered}
        selectedId={page.selected?.id}
        onDownloadTemplate={page.downloadTemplate}
        onImportCsv={page.importCsvFile}
        importing={page.importing}
        openRecord={(id) => {
          page.setSelectedId(id);
          page.setDrawerOpen(true);
        }}
      />

      <SdsDrawer
        open={page.drawerOpen}
        onOpenChange={page.setDrawerOpen}
        selected={page.selected}
        onEdit={() => page.setEditOpen(true)}
      />

      <SdsEditDialog
        open={page.editOpen}
        onOpenChange={page.setEditOpen}
        selected={page.selected}
        editMeta={page.editMeta}
        setEditMeta={page.setEditMeta}
        editFile={page.editFile}
        setEditFile={page.setEditFile}
        editTab={page.editTab}
        setEditTab={page.setEditTab}
        editDraftBySectionId={page.editDraftBySectionId}
        setEditDraftBySectionId={page.setEditDraftBySectionId}
        sectionTitleById={page.sectionTitleById}
        onSave={page.saveRecord}
      />

      <SdsImportValidationDialog
        open={page.importValidationOpen}
        onOpenChange={page.setImportValidationOpen}
        fileName={page.importValidationFileName}
        issues={page.importValidationIssues}
      />
    </div>
  );
}
