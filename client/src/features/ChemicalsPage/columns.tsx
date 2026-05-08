import * as React from "react";

import type { DataColumn } from "@/core/components/DataTable";
import type { Chemical } from "@/core/types/ems";
import { renderChemicalApproval, renderChemicalExpiry, renderChemicalHazard, renderChemicalName, renderChemicalStock } from "./column-cells";

export function getChemicalColumns(getCompanyName: (id: string) => string): Array<DataColumn<Chemical>> {
  return [
    { id: "chemical", header: "Chemical", cell: renderChemicalName, className: "min-w-[360px]" },
    { id: "company", header: "Company", cell: (chemical) => <div className="text-sm">{getCompanyName(String(chemical.facilityId))}</div>, className: "min-w-[220px]" },
    { id: "hazard", header: "Hazard", cell: renderChemicalHazard, className: "min-w-[240px]" },
    { id: "approval", header: "Approval", cell: renderChemicalApproval, className: "min-w-[140px]" },
    { id: "stock", header: "Stock", cell: renderChemicalStock, className: "min-w-[140px] text-right" },
    { id: "expiry", header: "Expiry", cell: renderChemicalExpiry, className: "min-w-[200px] text-right" },
  ];
}
