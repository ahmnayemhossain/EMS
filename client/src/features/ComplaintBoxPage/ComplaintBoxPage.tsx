import { Tabs } from "@/core/app/components/ui/tabs";
import { useSelectedCompany } from "@/core/app/state/company";
import { useReportBox } from "@/core/app/state/report-box";
import { useCurrentUser } from "@/core/app/state/user";
import { formatUserLabel } from "@/core/data/users";

import { ComplaintBoxOverlays } from "@/features/ComplaintBoxPage/ComplaintBoxOverlays";
import { ComplaintBoxTabs } from "@/features/ComplaintBoxPage/ComplaintBoxTabs";
import { ComplaintBoxHeader } from "@/features/ComplaintBoxPage/components/ComplaintBoxHeader";
import { getPublicReportBoxUrl } from "@/features/ComplaintBoxPage/utils";
import { useComplaintBoxPage } from "@/features/ComplaintBoxPage/useComplaintBoxPage";
import { useComplaintSelectionSync } from "@/features/ComplaintBoxPage/useComplaintSelectionSync";

export function ComplaintBoxPage() {
  const { selectedCompanyId } = useSelectedCompany();
  const currentUser = useCurrentUser();
  const currentUserLabel = currentUser ? formatUserLabel(currentUser) : "User";
  const page = useComplaintBoxPage();

  const {
    reports,
    records,
    setSubject,
    removeRecord,
    toggleFlag,
    setStatus,
    setCategory,
    assignTo,
    addMessage,
    addRecord,
    deleteReport,
    refreshFromInbox,
  } = useReportBox();

  const publicUrl = getPublicReportBoxUrl(selectedCompanyId);
  const flaggedCount = reports.filter((report) => report.flagged).length;

  useComplaintSelectionSync({ reports, selectedComplaint: page.selectedComplaint, setSelectedComplaint: page.setSelectedComplaint });

  return (
    <Tabs value={page.tab} onValueChange={(value) => page.setTab(value as typeof page.tab)} className="space-y-6">
      <ComplaintBoxHeader
        flaggedCount={flaggedCount}
        showFlaggedOnly={page.showFlaggedOnly}
        onToggleFlagged={() => page.setShowFlaggedOnly((value) => !value)}
        refreshingInbox={page.refreshingInbox}
        onRefresh={async () => {
          page.setRefreshingInbox(true);
          try {
            await refreshFromInbox();
          } finally {
            page.setRefreshingInbox(false);
          }
        }}
      />

      <ComplaintBoxTabs
        reports={reports}
        records={records}
        publicUrl={publicUrl}
        flaggedCount={flaggedCount}
        showFlaggedOnly={page.showFlaggedOnly}
        onOpenComplaint={(report) => {
          page.setSelectedComplaint(report);
          page.setDrawerOpen(true);
        }}
        onRequestRemoveRecord={(record) => page.setAction({ kind: "remove-record", record })}
      />

      <ComplaintBoxOverlays
        action={page.action}
        onCloseAction={() => page.setAction(null)}
        removeRecord={removeRecord}
        deleteReport={deleteReport}
        closeDrawer={() => page.setDrawerOpen(false)}
        clearComplaint={() => page.setSelectedComplaint(null)}
        drawer={{
          open: page.drawerOpen,
          onOpenChange: (open) => {
            page.setDrawerOpen(open);
            if (!open) page.setSelectedComplaint(null);
          },
          complaint: page.selectedComplaint,
          currentUserLabel,
          addRecord,
          onSwitchToRecords: () => page.setTab("records"),
          onRequestDeleteComplaint: (report) => page.setAction({ kind: "delete-complaint", report }),
          setSubject,
          setCategory,
          assignTo,
          toggleFlag,
          setStatus,
          addMessage,
        }}
      />
    </Tabs>
  );
}
