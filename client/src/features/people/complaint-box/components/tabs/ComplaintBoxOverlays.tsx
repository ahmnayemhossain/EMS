import type { ReportBoxReport } from "@/core/types/models/ems";

import { handleComplaintAction } from "@/features/people/complaint-box/actions/getComplaintActionHandler";
import { ComplaintBoxActionModal } from "@/features/people/complaint-box/components/tabs/ComplaintBoxActionModal";
import type { ComplaintBoxAction } from "@/features/people/complaint-box/config/complaint-box.types";
import { ComplaintDrawer } from "@/features/people/complaint-box/drawer/ComplaintDrawer";

export function ComplaintBoxOverlays(props: ComplaintBoxOverlaysProps) {
  return (
    <>
      <ComplaintDrawer {...props.drawer} reportAssignees={props.reportAssignees} />
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
  reportAssignees: string[];
  action: ComplaintBoxAction;
  onCloseAction: () => void;
  removeRecord: (recordId: string) => void;
  deleteReport: (reportId: string) => Promise<void>;
  closeDrawer: () => void;
  clearComplaint: () => void;
  drawer: Omit<React.ComponentProps<typeof ComplaintDrawer>, "reportAssignees">;
};
