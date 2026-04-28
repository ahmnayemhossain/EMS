import * as React from "react";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { useSelectedCompany } from "@/app/state/company";
import { useReportBox } from "@/app/state/report-box";
import { useCurrentUser } from "@/app/state/user";
import { formatUserLabel } from "@/data/users";
import { reportAssignees } from "@/data/report-box";
import { ActionModal } from "@/components/ActionModal";
import type { ReportBoxRecord, ReportBoxReport } from "@/types/ems";

import { ComplaintBoxHeader } from "@/pages/ComplaintBoxPage/components/ComplaintBoxHeader";
import { ComplaintsTab } from "@/pages/ComplaintBoxPage/components/ComplaintsTab";
import { ComplaintRecordsTab } from "@/pages/ComplaintBoxPage/components/ComplaintRecordsTab";
import { ComplaintTrendTab } from "@/pages/ComplaintBoxPage/components/ComplaintTrendTab";
import { ComplaintDrawer } from "@/pages/ComplaintBoxPage/drawer/ComplaintDrawer";
import { getPublicReportBoxUrl } from "@/pages/ComplaintBoxPage/utils";

type Action = { kind: "delete-complaint"; report: ReportBoxReport } | { kind: "remove-record"; record: ReportBoxRecord } | null;

export function ComplaintBoxPage() {
  const { selectedCompanyId } = useSelectedCompany();
  const currentUser = useCurrentUser();
  const currentUserLabel = currentUser ? formatUserLabel(currentUser) : "User";

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

  const [tab, setTab] = React.useState<"complaints" | "complaint-trend" | "records">("complaints");
  const [showFlaggedOnly, setShowFlaggedOnly] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] = React.useState<ReportBoxReport | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [refreshingInbox, setRefreshingInbox] = React.useState(false);
  const [action, setAction] = React.useState<Action>(null);

  const publicUrl = React.useMemo(() => getPublicReportBoxUrl(selectedCompanyId), [selectedCompanyId]);
  const flaggedCount = React.useMemo(() => reports.filter((r) => r.flagged).length, [reports]);

  React.useEffect(() => {
    if (!selectedComplaint) return;
    const latest = reports.find((r) => r.id === selectedComplaint.id) || null;
    setSelectedComplaint(latest);
  }, [reports, selectedComplaint?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
      <ComplaintBoxHeader
        flaggedCount={flaggedCount}
        showFlaggedOnly={showFlaggedOnly}
        onToggleFlagged={() => setShowFlaggedOnly((v) => !v)}
        refreshingInbox={refreshingInbox}
        onRefresh={async () => {
          setRefreshingInbox(true);
          try {
            await refreshFromInbox();
          } finally {
            setRefreshingInbox(false);
          }
        }}
      />

      <TabsContent value="complaints">
        <ComplaintsTab
          reports={reports}
          publicUrl={publicUrl}
          showFlaggedOnly={showFlaggedOnly}
          onOpenComplaint={(r) => {
            setSelectedComplaint(r);
            setDrawerOpen(true);
          }}
        />
      </TabsContent>

      <TabsContent value="complaint-trend">
        <ComplaintTrendTab reports={reports} flaggedCount={flaggedCount} />
      </TabsContent>

      <TabsContent value="records">
        <ComplaintRecordsTab
          records={records}
          onRequestRemoveRecord={(r) => setAction({ kind: "remove-record", record: r })}
        />
      </TabsContent>

      <ComplaintDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
        currentUserLabel={currentUserLabel}
        reportAssignees={reportAssignees}
        addRecord={addRecord}
        onSwitchToRecords={() => setTab("records")}
        onRequestDeleteComplaint={(r) => setAction({ kind: "delete-complaint", report: r })}
        setSubject={setSubject}
        setCategory={setCategory}
        assignTo={assignTo}
        toggleFlag={toggleFlag}
        setStatus={setStatus}
        addMessage={addMessage}
      />

      <ActionModal
        open={Boolean(action)}
        onOpenChange={(o) => (!o ? setAction(null) : null)}
        tone="destructive"
        title={
          action?.kind === "delete-complaint"
            ? "Delete this complaint?"
            : action?.kind === "remove-record"
              ? "Remove this record?"
              : "Confirm action"
        }
        description={
          action?.kind === "delete-complaint"
            ? "This removes it from the UI and (if it came from inbox files) deletes the inbox copy."
            : action?.kind === "remove-record"
              ? "This removes the saved record. The complaint remains unchanged."
              : undefined
        }
        confirmLabel={action?.kind === "delete-complaint" ? "Delete" : "Remove"}
        onConfirm={async () => {
          if (!action) return;
          if (action.kind === "delete-complaint") {
            await deleteReport(action.report.id);
            setDrawerOpen(false);
            setSelectedComplaint(null);
            return;
          }
          if (action.kind === "remove-record") removeRecord(action.record.id);
        }}
      />
    </Tabs>
  );
}
