import { CheckCircle2, Flag, FlagOff } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/app/components/ui/select";
import type { ReportBoxReport } from "@/core/types/ems";

export function DrawerStatusActions({
  statusDraft,
  flaggedDraft,
  onStatusChange,
  onFlaggedToggle,
  onDelete,
}: {
  statusDraft: ReportBoxReport["status"];
  flaggedDraft: boolean;
  onStatusChange: (value: ReportBoxReport["status"]) => void;
  onFlaggedToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant={flaggedDraft ? "destructive" : "outline"} onClick={onFlaggedToggle}>
        {flaggedDraft ? <FlagOff className="mr-2 size-4" /> : <Flag className="mr-2 size-4" />}
        {flaggedDraft ? "Unflag" : "Flag"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => onStatusChange(statusDraft === "handled" ? "triaged" : "handled")}>
        <CheckCircle2 className="mr-2 size-4" />
        {statusDraft === "handled" ? "Reopen" : "Mark handled"}
      </Button>
      <Select value={statusDraft} onValueChange={(value) => onStatusChange(value as ReportBoxReport["status"])}>
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
  );
}
