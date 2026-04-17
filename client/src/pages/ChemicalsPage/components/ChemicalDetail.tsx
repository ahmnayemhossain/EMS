import * as React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import type { Chemical } from "@/types/ems";
import { formatNumber } from "@/utils/format";

export function ChemicalDetail({
  chemical,
  sdsFileName,
}: {
  chemical: Chemical;
  sdsFileName?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Approval</div>
          <div className="mt-1">
            <StatusBadge
              tone={
                chemical.approvalStatus === "approved"
                  ? "compliant"
                  : chemical.approvalStatus === "pending"
                    ? "warning"
                    : "critical"
              }
            >
              {chemical.approvalStatus}
            </StatusBadge>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Stock</div>
          <div className="mt-1 text-sm font-semibold">
            {formatNumber(chemical.stockKg)} kg
          </div>
          {typeof chemical.minStockKg === "number" ? (
            <div className="text-muted-foreground mt-1 text-xs">
              Min: {formatNumber(chemical.minStockKg)} kg
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-muted-foreground text-xs">SDS link</div>
            <div className="mt-1 truncate text-sm font-medium">
              {chemical.sdsId ? sdsFileName ?? "SDS record" : "No SDS linked"}
            </div>
          </div>
          {chemical.sdsId ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/sds">
                Open SDS
                <ExternalLink className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <StatusBadge tone="warning">
              <AlertTriangle className="size-3" />
              Missing SDS
            </StatusBadge>
          )}
        </div>
      </div>

      <Tabs defaultValue="safety">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="safety" className="mt-3 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">Hazard pictograms</div>
            <div className="text-muted-foreground mt-1 text-sm">
              Placeholder for GHS pictograms mapped by hazard class.
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">PPE</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {chemical.ppe.map((p) => (
                <StatusBadge key={p} tone="info">
                  {p}
                </StatusBadge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="mt-3 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">Storage notes</div>
            <div className="text-muted-foreground mt-1 text-sm">
              Placeholder for segregation and compatibility checks.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="mt-3 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">Movement ledger</div>
            <div className="text-muted-foreground mt-1 text-sm">
              Placeholder for issue/receive logs.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

