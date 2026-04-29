import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";
import type { Chemical, HazardClass } from "@/types/ems";
import { formatDate, formatNumber } from "@/utils/format";

import { hazardLabels } from "./constants";
import { daysUntil } from "./utils";

export function renderChemicalName(chemical: Chemical) {
  return <div className="min-w-0"><div className="truncate font-medium">{chemical.name}</div><div className="text-muted-foreground mt-1 text-xs">{chemical.supplier} • {chemical.storageArea}</div></div>;
}

export function renderChemicalCompany(chemical: Chemical) {
  return <div className="text-sm">{getFacilityName(chemical.facilityId)}</div>;
}

export function renderChemicalHazard(chemical: Chemical) {
  return <div className="flex flex-wrap gap-1">{chemical.hazardClasses.slice(0, 2).map((hazard) => <StatusBadge key={hazard} tone="info">{hazardLabels[hazard as HazardClass]}</StatusBadge>)}{chemical.hazardClasses.length > 2 ? <StatusBadge tone="neutral">+{chemical.hazardClasses.length - 2}</StatusBadge> : null}</div>;
}

export function renderChemicalApproval(chemical: Chemical) {
  return <StatusBadge tone={chemical.approvalStatus === "approved" ? "compliant" : chemical.approvalStatus === "pending" ? "warning" : "critical"}>{chemical.approvalStatus}</StatusBadge>;
}

export function renderChemicalStock(chemical: Chemical) {
  return <div className="text-right font-medium tabular-nums">{formatNumber(chemical.stockKg)} kg</div>;
}

export function renderChemicalExpiry(chemical: Chemical) {
  const days = daysUntil(chemical.expiryDate);
  const tone = typeof days === "number" && days < 0 ? "critical" : typeof days === "number" && days <= 60 ? "warning" : "neutral";
  return <div className="flex justify-end"><StatusBadge tone={tone}>{chemical.expiryDate ? formatDate(chemical.expiryDate) : "—"}</StatusBadge></div>;
}
