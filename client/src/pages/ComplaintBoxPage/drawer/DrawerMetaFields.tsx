import { CheckCircle2, Flag, FlagOff } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { cn } from "@/app/components/ui/utils";
import type { ReportBoxReport } from "@/types/ems";

import { complaintCategories } from "@/pages/ComplaintBoxPage/constants";

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
        <div className="text-muted-foreground text-xs">
          Report title <span className="text-destructive">*</span>
        </div>
        <Input
          value={titleDraft}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add a title"
          className={cn(showValidation && !titleDraft.trim() && "border-destructive")}
          aria-invalid={showValidation && !titleDraft.trim() ? true : undefined}
        />
      </div>

      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">
          Category <span className="text-destructive">*</span>
        </div>
        <Select value={categoryDraft} onValueChange={(v) => onCategoryChange(v)}>
          <SelectTrigger className={cn(showValidation && !categoryDraft && "border-destructive")}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {complaintCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">
          Supervisor <span className="text-destructive">*</span>
        </div>
        <Select value={assigneeDraft} onValueChange={(v) => onAssigneeChange(v)}>
          <SelectTrigger className={cn(showValidation && !assigneeDraft && "border-destructive")}>
            <SelectValue placeholder="Assign supervisor" />
          </SelectTrigger>
          <SelectContent>
            {reportAssignees.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={flaggedDraft ? "destructive" : "outline"} onClick={onFlaggedToggle}>
          {flaggedDraft ? <FlagOff className="mr-2 size-4" /> : <Flag className="mr-2 size-4" />}
          {flaggedDraft ? "Unflag" : "Flag"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(statusDraft === "handled" ? "triaged" : "handled")}
        >
          <CheckCircle2 className="mr-2 size-4" />
          {statusDraft === "handled" ? "Reopen" : "Mark handled"}
        </Button>
        <Select value={statusDraft} onValueChange={(v) => onStatusChange(v as ReportBoxReport["status"])}>
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">new</SelectItem>
            <SelectItem value="triaged">triaged</SelectItem>
            <SelectItem value="handled">handled</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </>
  );
}

