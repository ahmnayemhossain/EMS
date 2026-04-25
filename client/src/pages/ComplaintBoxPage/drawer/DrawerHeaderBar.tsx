import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { ReportBoxReport } from "@/types/ems";

import { complaintCategories } from "@/pages/ComplaintBoxPage/constants";

export function DrawerHeaderBar({
  complaint,
  currentUserLabel,
  statusDraft,
  flaggedDraft,
  categoryDraft,
  drawerDirty,
  onRecord,
  onSave,
}: {
  complaint: ReportBoxReport;
  currentUserLabel: string;
  statusDraft: ReportBoxReport["status"];
  flaggedDraft: boolean;
  categoryDraft: string;
  drawerDirty: boolean;
  onRecord: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={statusDraft === "handled" ? "compliant" : statusDraft === "triaged" ? "warning" : "info"}>
          {statusDraft}
        </StatusBadge>
        {flaggedDraft ? <StatusBadge tone="critical">flagged</StatusBadge> : null}
        {categoryDraft ? (
          <StatusBadge tone="neutral">
            {complaintCategories.find((c) => c.value === categoryDraft)?.label || categoryDraft}
          </StatusBadge>
        ) : null}
        {drawerDirty ? <StatusBadge tone="neutral">unsaved</StatusBadge> : null}
        {statusDraft === "handled" ? (
          <div className="text-muted-foreground text-xs">
            Handler:{" "}
            <span className="text-foreground font-medium">
              {complaint.status === "handled" ? complaint.handledBy || currentUserLabel : currentUserLabel}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
        <Button
          size="sm"
          className="w-full sm:w-auto"
          variant="outline"
          onClick={() => {
            if (drawerDirty) return toast.error("Please save first.");
            onRecord();
          }}
          disabled={drawerDirty}
        >
          Record
        </Button>
        <Button size="sm" className="w-full sm:w-auto" onClick={onSave} disabled={!drawerDirty}>
          Save
        </Button>
      </div>
    </div>
  );
}

