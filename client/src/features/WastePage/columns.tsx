import * as React from "react";

import type { DataColumn } from "@/core/components/DataTable";
import { StatusBadge } from "@/core/components/StatusBadge";
import { getFacilityName } from "@/core/data/mock";
import type { WasteRecord, WasteType } from "@/core/types/ems";
import { formatDate, formatNumber } from "@/core/utils/format";

function toneForWasteType(type: WasteType) {
  if (type === "hazardous" || type === "sludge") return "warning";
  if (type === "e_waste") return "info";
  return "compliant";
}

export function getWasteColumns(): Array<DataColumn<WasteRecord>> {
  return [
    {
      id: "stream",
      header: "Waste stream",
      cell: (w) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{w.stream}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(w.facilityId)} • {w.storageLocation}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    {
      id: "type",
      header: "Type",
      cell: (w) => (
        <StatusBadge tone={toneForWasteType(w.type)}>
          {w.type.replace(/_/g, " ")}
        </StatusBadge>
      ),
      className: "min-w-[160px]",
    },
    {
      id: "qty",
      header: "Qty",
      cell: (w) => (
        <div className="text-right font-medium tabular-nums">
          {formatNumber(w.qtyKg)} kg
        </div>
      ),
      className: "text-right min-w-[120px]",
    },
    {
      id: "status",
      header: "Disposal",
      cell: (w) => (
        <div className="flex justify-end">
          <StatusBadge
            tone={
              w.disposalStatus === "disposed"
                ? "compliant"
                : w.disposalStatus === "scheduled"
                  ? "warning"
                  : "critical"
            }
          >
            {w.disposalStatus}
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[140px]",
    },
    {
      id: "due",
      header: "Due by",
      cell: (w) => (
        <div className="flex justify-end">
          <StatusBadge tone={w.dueBy ? "warning" : "neutral"}>
            {w.dueBy ? formatDate(w.dueBy) : "—"}
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[140px]",
    },
  ];
}

