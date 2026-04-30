import { Flag, RefreshCw } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { TabsList, TabsTrigger } from "@/core/app/components/ui/tabs";

export type ComplaintBoxTab = "complaints" | "complaint-trend" | "records";

export function ComplaintBoxHeader({
  flaggedCount,
  showFlaggedOnly,
  onToggleFlagged,
  refreshingInbox,
  onRefresh,
}: {
  flaggedCount: number;
  showFlaggedOnly: boolean;
  onToggleFlagged: () => void;
  refreshingInbox: boolean;
  onRefresh: () => Promise<void> | void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1">
        <TabsTrigger value="complaints" className="min-w-0">
          <span className="truncate">Complaint box</span>
        </TabsTrigger>
        <TabsTrigger value="complaint-trend" className="min-w-0">
          <span className="truncate">Complaint trend</span>
        </TabsTrigger>
        <TabsTrigger value="records" className="min-w-0">
          <span className="truncate">Records</span>
        </TabsTrigger>
      </TabsList>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          variant={showFlaggedOnly ? "destructive" : "outline"}
          onClick={onToggleFlagged}
        >
          <Flag className={showFlaggedOnly ? "mr-2 size-4 fill-current" : "mr-2 size-4"} />
          Flagged ({flaggedCount})
        </Button>
        <Button
          className="w-full sm:w-auto"
          variant="outline"
          onClick={onRefresh}
          disabled={refreshingInbox}
        >
          <RefreshCw className={refreshingInbox ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
          Refresh
        </Button>
      </div>
    </div>
  );
}

