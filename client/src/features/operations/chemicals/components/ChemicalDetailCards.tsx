import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Chemical } from "@/core/types/models/ems";
import { formatNumber } from "@/core/utils/format";

export function ChemicalSummaryCards({
  chemical,
  sdsFileName,
  onUnlinkSds,
  unlinking = false,
}: {
  chemical: Chemical;
  sdsFileName?: string;
  onUnlinkSds?: () => void;
  unlinking?: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3"><div className="text-muted-foreground text-xs">Approval</div><div className="mt-1"><StatusBadge tone={getApprovalTone(chemical)}>{chemical.approvalStatus}</StatusBadge></div></div>
        <div className="rounded-lg border p-3"><div className="text-muted-foreground text-xs">Stock</div><div className="mt-1 text-sm font-semibold">{formatNumber(chemical.stockKg)} kg</div>{typeof chemical.minStockKg === "number" ? <div className="text-muted-foreground mt-1 text-xs">Min: {formatNumber(chemical.minStockKg)} kg</div> : null}</div>
      </div>
      <div className="rounded-lg border p-3">
          <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><div className="text-muted-foreground text-xs">SDS link</div><div className="mt-1 truncate text-sm font-medium">{chemical.sdsId ? sdsFileName ?? "SDS record" : "No SDS linked"}</div></div>
          {chemical.sdsId ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm"><Link to={`/sds?sdsId=${encodeURIComponent(String(chemical.sdsId))}`}>Open SDS<ExternalLink className="ml-2 size-4" /></Link></Button>
              <Button type="button" variant="destructive" size="sm" disabled={unlinking} onClick={onUnlinkSds}>
                {unlinking ? "Removing..." : "Remove SDS"}
              </Button>
            </div>
          ) : <StatusBadge tone="warning"><AlertTriangle className="size-3" />Missing SDS</StatusBadge>}
        </div>
      </div>
    </>
  );
}

function getApprovalTone(chemical: Chemical) {
  if (chemical.approvalStatus === "approved") return "compliant";
  if (chemical.approvalStatus === "pending") return "warning";
  return "critical";
}

