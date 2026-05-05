import { PageHeader } from "@/core/components/PageHeader";

import { SdsCreateDialog } from "./SdsPage/SdsCreateDialog";
import { SdsDrawer } from "./SdsPage/SdsDrawer";
import { SdsEditDialog } from "./SdsPage/SdsEditDialog";
import { SdsListCard } from "./SdsPage/SdsListCard";
import { useSdsPage } from "./SdsPage/use-sds-page";

export function SdsPage() {
  const page = useSdsPage();
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <SdsCreateDialog
            open={page.createOpen}
            onOpenChange={page.setCreateOpen}
            createMeta={page.createMeta}
            setCreateMeta={page.setCreateMeta}
            createTab={page.createTab}
            setCreateTab={page.setCreateTab}
            createDraftBySectionId={page.createDraftBySectionId}
            setCreateDraftBySectionId={page.setCreateDraftBySectionId}
            createErrors={page.createErrors}
            sectionTitleById={page.sectionTitleById}
            onCreate={page.createRecord}
          />
        }
      />

      <SdsListCard
        suppliers={page.suppliers}
        latestRevision={page.latestRevision}
        search={page.search}
        setSearch={page.setSearch}
        filtered={page.filtered}
        selectedId={page.selected?.id}
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
        editTab={page.editTab}
        setEditTab={page.setEditTab}
        editDraftBySectionId={page.editDraftBySectionId}
        setEditDraftBySectionId={page.setEditDraftBySectionId}
        sectionTitleById={page.sectionTitleById}
        onSave={page.saveRecord}
      />
    </div>
  );
}
