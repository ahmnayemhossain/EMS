import * as React from "react";

import { Tabs } from "@/components/ui/primitives/tabs";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useReportBox } from "@/core/app/state/slices/report-box";
import { useCurrentUser } from "@/core/app/state/slices/user";
import { formatUserLabel } from "@/core/users/format-user-label";

import { ComplaintBoxHeader } from "@/features/people/complaint-box/components/tabs/ComplaintBoxHeader";
import { ComplaintBoxOverlays } from "@/features/people/complaint-box/components/tabs/ComplaintBoxOverlays";
import { ComplaintBoxTabs } from "@/features/people/complaint-box/components/tabs/ComplaintBoxTabs";
import { getPublicReportBoxUrl, getWorkingUsersForComplaint } from "@/features/people/complaint-box/config/utils";
import { useComplaintBoxPage } from "@/features/people/complaint-box/hooks/useComplaintBoxPage";
import { useComplaintSelectionSync } from "@/features/people/complaint-box/hooks/useComplaintSelectionSync";

export function ComplaintBoxPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
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

  const publicUrl = getPublicReportBoxUrl(selectedCompanyId, companies);
  const flaggedCount = reports.filter((report) => report.flagged).length;
  const reportAssignees = React.useMemo(() => {
    const seen = new Set<string>();
    const labels: string[] = [];

    const push = (value?: string | null) => {
      const label = String(value || "").trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      labels.push(label);
    };

    push(currentUserLabel);
    for (const report of reports) {
      push(report.assignedTo);
      push(report.handledBy);
      for (const person of getWorkingUsersForComplaint(report)) push(person.label);
    }

    return labels;
  }, [currentUserLabel, reports]);

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
        reportAssignees={reportAssignees}
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
