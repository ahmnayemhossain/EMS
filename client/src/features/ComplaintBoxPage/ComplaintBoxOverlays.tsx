import { reportAssignees } from "@/core/data/report-box";

import { ComplaintBoxActionModal } from "@/features/ComplaintBoxPage/ComplaintBoxActionModal";
import type { ComplaintBoxAction } from "@/features/ComplaintBoxPage/complaint-box.types";
import { ComplaintDrawer } from "@/features/ComplaintBoxPage/drawer/ComplaintDrawer";
import { handleComplaintAction } from "@/features/ComplaintBoxPage/getComplaintActionHandler";
import type { ReportBoxReport } from "@/core/types/ems";

export function ComplaintBoxOverlays(props: ComplaintBoxOverlaysProps) {
  return (
    <>
      <ComplaintDrawer {...props.drawer} reportAssignees={reportAssignees} />
      <ComplaintBoxActionModal
        action={props.action}
        onClose={props.onCloseAction}
        onConfirm={() =>
          handleComplaintAction({
            action: props.action,
            removeRecord: props.removeRecord,
            deleteReport: props.deleteReport,
            closeDrawer: props.closeDrawer,
            clearComplaint: props.clearComplaint,
          })
        }
      />
    </>
  );
}

type ComplaintBoxOverlaysProps = {
  action: ComplaintBoxAction;
  onCloseAction: () => void;
  removeRecord: (recordId: string) => void;
  deleteReport: (reportId: string) => Promise<void>;
  closeDrawer: () => void;
  clearComplaint: () => void;
  drawer: Omit<React.ComponentProps<typeof ComplaintDrawer>, "reportAssignees">;
};
