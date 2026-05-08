import type { Chemical, HazardClass } from "@/core/types/ems";

import { daysUntil } from "./utils";

export function filterChemicals(input: {
  rows: Chemical[] | null | undefined;
  search: string;
  companyId?: string;
  hazard?: string;
  approval?: string;
  expiryFrom: string;
  expiryTo: string;
}) {
  const expiryFromTs = input.expiryFrom ? new Date(input.expiryFrom).getTime() : undefined;
  const expiryToTs = input.expiryTo ? new Date(input.expiryTo).getTime() : undefined;
  const query = input.search.trim().toLowerCase();

  const rows = (input.rows ?? [])
    .filter((chemical) => (input.companyId ? chemical.facilityId === input.companyId : true))
    .filter((chemical) => (input.hazard ? chemical.hazardClasses.includes(input.hazard as HazardClass) : true))
    .filter((chemical) => (input.approval ? chemical.approvalStatus === (input.approval as Chemical["approvalStatus"]) : true))
    .filter((chemical) => withinExpiryRange(chemical, expiryFromTs, expiryToTs))
    .filter((chemical) => matchesChemicalSearch(chemical, query));

  return {
    rows,
    total: rows.length,
    restricted: rows.filter((chemical) => chemical.approvalStatus === "restricted").length,
    missingSds: rows.filter((chemical) => !chemical.sdsId).length,
    nearExpiry: rows.filter((chemical) => isNearExpiry(chemical)).length,
    hazardousStock: rows.filter((chemical) => chemical.hazardClasses.length >= 2).length,
    nonApproved: rows.filter((chemical) => chemical.approvalStatus !== "approved").length,
  };
}

function withinExpiryRange(chemical: Chemical, expiryFromTs?: number, expiryToTs?: number) {
  if (!expiryFromTs && !expiryToTs) return true;
  if (!chemical.expiryDate) return false;
  const ts = new Date(chemical.expiryDate).getTime();
  if (expiryFromTs && ts < expiryFromTs) return false;
  if (expiryToTs && ts > expiryToTs) return false;
  return true;
}

function matchesChemicalSearch(chemical: Chemical, query: string) {
  if (!query) return true;
  return (
    chemical.name.toLowerCase().includes(query) ||
    chemical.supplier.toLowerCase().includes(query) ||
    chemical.storageArea.toLowerCase().includes(query)
  );
}

function isNearExpiry(chemical: Chemical) {
  const days = daysUntil(chemical.expiryDate);
  return typeof days === "number" && days >= 0 && days <= 60;
}
