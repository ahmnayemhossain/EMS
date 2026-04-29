import type { ComplaintBoxAction } from "@/pages/ComplaintBoxPage/complaint-box.types";

export async function handleComplaintAction({
  action,
  removeRecord,
  deleteReport,
  closeDrawer,
  clearComplaint,
}: {
  action: ComplaintBoxAction;
  removeRecord: (recordId: string) => void;
  deleteReport: (reportId: string) => Promise<void>;
  closeDrawer: () => void;
  clearComplaint: () => void;
}) {
  if (!action) return;
  if (action.kind === "delete-complaint") {
    await deleteReport(action.report.id);
    closeDrawer();
    clearComplaint();
    return;
  }
  removeRecord(action.record.id);
}
