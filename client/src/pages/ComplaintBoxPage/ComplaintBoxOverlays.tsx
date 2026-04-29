import { reportAssignees } from "@/data/report-box";

import { ComplaintBoxActionModal } from "@/pages/ComplaintBoxPage/ComplaintBoxActionModal";
import type { ComplaintBoxAction } from "@/pages/ComplaintBoxPage/complaint-box.types";
import { ComplaintDrawer } from "@/pages/ComplaintBoxPage/drawer/ComplaintDrawer";
import { handleComplaintAction } from "@/pages/ComplaintBoxPage/getComplaintActionHandler";
import type { ReportBoxReport } from "@/types/ems";

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
