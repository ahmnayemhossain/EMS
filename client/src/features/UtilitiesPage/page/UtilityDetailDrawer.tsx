import { CheckCheck, Edit, Send, Trash2 } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { DetailPanel } from "@/core/components/DetailPanel";
import { UtilityRecordDetail } from "@/features/UtilitiesPage/UtilityRecordDetail";
import type { UtilityRecord } from "@/core/types/ems";
import { formatDate, formatUtilityType } from "@/core/utils/format";

export function UtilityDetailDrawer(props: {
  selected: UtilityRecord | null;
  companies: Array<{ id: string; name: string }>;
  getCompanyName: (id: string) => string;
  onSelect: (record: UtilityRecord | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  onApproveMonth: () => void | Promise<void>;
  onSubmitMonth: () => void | Promise<void>;
}) {
  const description = props.selected
    ? `${props.companies.find((company) => company.id === props.selected?.facilityId)?.name || "Company"} • ${formatDate(props.selected.periodStart)} to ${formatDate(props.selected.periodEnd)}`
    : undefined;
  const approveDisabled =
    !props.selected ||
    props.selected.approvalStatus !== "submitted" ||
    Number(props.selected.missingDaysCount || 0) > 0;
  const submitDisabled =
    !props.selected ||
    !props.selected.monthComplete ||
    props.selected.approvalStatus !== "pending";

  return (
    <DetailPanel
      open={Boolean(props.selected)}
      onOpenChange={(open) => {
        if (!open) props.onSelect(null);
      }}
      title={props.selected ? `${formatUtilityType(props.selected.type)} — ${props.selected.meterName}` : "Utility record"}
      description={description}
    >
      {props.selected ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" onClick={props.onEdit}>
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => void props.onSubmitMonth()} disabled={submitDisabled}>
              <Send className="mr-2 size-4" />
              {props.selected.approvalStatus === "submitted" ? "Submitted" : "Submit"}
            </Button>
            <Button onClick={() => void props.onApproveMonth()} disabled={approveDisabled}>
              <CheckCheck className="mr-2 size-4" />
              {props.selected.approvalStatus === "approved" ? "Approved" : "Approve month"}
            </Button>
            <Button variant="destructive" onClick={props.onDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
          <UtilityRecordDetail
            record={props.selected}
            companyName={props.getCompanyName(props.selected.facilityId)}
          />
        </div>
      ) : null}
    </DetailPanel>
  );
}
