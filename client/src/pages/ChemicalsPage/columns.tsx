import * as React from "react";

import type { DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";
import type { Chemical, HazardClass } from "@/types/ems";
import { formatDate, formatNumber } from "@/utils/format";

import { hazardLabels } from "./constants";
import { daysUntil } from "./utils";

export function getChemicalColumns(): Array<DataColumn<Chemical>> {
  return [
    {
      id: "chemical",
      header: "Chemical",
      cell: (c) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{c.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {c.supplier} • {c.storageArea}
          </div>
        </div>
      ),
      className: "min-w-[360px]",
    },
    {
      id: "company",
      header: "Company",
      cell: (c) => <div className="text-sm">{getFacilityName(c.facilityId)}</div>,
      className: "min-w-[220px]",
    },
    {
      id: "hazard",
      header: "Hazard",
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.hazardClasses.slice(0, 2).map((h) => (
            <StatusBadge key={h} tone="info">
              {hazardLabels[h as HazardClass]}
            </StatusBadge>
          ))}
          {c.hazardClasses.length > 2 ? (
            <StatusBadge tone="neutral">+{c.hazardClasses.length - 2}</StatusBadge>
          ) : null}
        </div>
      ),
      className: "min-w-[240px]",
    },
    {
      id: "approval",
      header: "Approval",
      cell: (c) => (
        <StatusBadge
          tone={
            c.approvalStatus === "approved"
              ? "compliant"
              : c.approvalStatus === "pending"
                ? "warning"
                : "critical"
          }
        >
          {c.approvalStatus}
        </StatusBadge>
      ),
      className: "min-w-[140px]",
    },
    {
      id: "stock",
      header: "Stock",
      cell: (c) => (
        <div className="text-right font-medium tabular-nums">
          {formatNumber(c.stockKg)} kg
        </div>
      ),
      className: "min-w-[140px] text-right",
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: (c) => {
        const d = daysUntil(c.expiryDate);
        const expiryTone =
          typeof d === "number" && d < 0
            ? "critical"
            : typeof d === "number" && d <= 60
              ? "warning"
              : "neutral";

        return (
          <div className="flex justify-end">
            <StatusBadge tone={expiryTone}>
              {c.expiryDate ? formatDate(c.expiryDate) : "—"}
            </StatusBadge>
          </div>
        );
      },
      className: "min-w-[200px] text-right",
    },
  ];
}

