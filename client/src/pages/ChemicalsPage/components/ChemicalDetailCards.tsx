import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/app/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Chemical } from "@/types/ems";
import { formatNumber } from "@/utils/format";

export function ChemicalSummaryCards({ chemical, sdsFileName }: { chemical: Chemical; sdsFileName?: string }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3"><div className="text-muted-foreground text-xs">Approval</div><div className="mt-1"><StatusBadge tone={getApprovalTone(chemical)}>{chemical.approvalStatus}</StatusBadge></div></div>
        <div className="rounded-lg border p-3"><div className="text-muted-foreground text-xs">Stock</div><div className="mt-1 text-sm font-semibold">{formatNumber(chemical.stockKg)} kg</div>{typeof chemical.minStockKg === "number" ? <div className="text-muted-foreground mt-1 text-xs">Min: {formatNumber(chemical.minStockKg)} kg</div> : null}</div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><div className="text-muted-foreground text-xs">SDS link</div><div className="mt-1 truncate text-sm font-medium">{chemical.sdsId ? sdsFileName ?? "SDS record" : "No SDS linked"}</div></div>
          {chemical.sdsId ? <Button asChild variant="outline" size="sm"><Link to="/sds">Open SDS<ExternalLink className="ml-2 size-4" /></Link></Button> : <StatusBadge tone="warning"><AlertTriangle className="size-3" />Missing SDS</StatusBadge>}
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
