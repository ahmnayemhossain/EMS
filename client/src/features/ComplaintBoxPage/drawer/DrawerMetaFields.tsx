import { Input } from "@/core/app/components/ui/input";
import { cn } from "@/core/app/components/ui/utils";
import type { ReportBoxReport } from "@/core/types/ems";

import { complaintCategories } from "@/features/ComplaintBoxPage/constants";
import { DrawerFieldLabel } from "@/features/ComplaintBoxPage/drawer/DrawerFieldLabel";
import { DrawerSelectField } from "@/features/ComplaintBoxPage/drawer/DrawerSelectField";
import { DrawerStatusActions } from "@/features/ComplaintBoxPage/drawer/DrawerStatusActions";

export function DrawerMetaFields({
  titleDraft,
  onTitleChange,
  categoryDraft,
  onCategoryChange,
  assigneeDraft,
  onAssigneeChange,
  statusDraft,
  onStatusChange,
  flaggedDraft,
  onFlaggedToggle,
  reportAssignees,
  showValidation,
  onDelete,
}: {
  titleDraft: string;
  onTitleChange: (v: string) => void;
  categoryDraft: string;
  onCategoryChange: (v: string) => void;
  assigneeDraft: string;
  onAssigneeChange: (v: string) => void;
  statusDraft: ReportBoxReport["status"];
  onStatusChange: (v: ReportBoxReport["status"]) => void;
  flaggedDraft: boolean;
  onFlaggedToggle: () => void;
  reportAssignees: string[];
  showValidation: boolean;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <DrawerFieldLabel label="Report title" required />
        <Input
          value={titleDraft}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add a title"
          className={cn(showValidation && !titleDraft.trim() && "border-destructive")}
          aria-invalid={showValidation && !titleDraft.trim() ? true : undefined}
        />
      </div>

      <DrawerSelectField
        label="Category"
        value={categoryDraft}
        placeholder="Select category"
        required
        invalid={showValidation && !categoryDraft}
        options={complaintCategories}
        onChange={onCategoryChange}
      />

      <DrawerSelectField
        label="Supervisor"
        value={assigneeDraft}
        placeholder="Assign supervisor"
        required
        invalid={showValidation && !assigneeDraft}
        options={reportAssignees.map((person) => ({ value: person, label: person }))}
        onChange={onAssigneeChange}
      />

      <DrawerStatusActions
        statusDraft={statusDraft}
        flaggedDraft={flaggedDraft}
        onStatusChange={onStatusChange}
        onFlaggedToggle={onFlaggedToggle}
        onDelete={onDelete}
      />
    </>
  );
}
