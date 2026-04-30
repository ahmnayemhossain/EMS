import * as React from "react";

import { chemicals, getFacilityName } from "@/core/data/mock";
import type { Chemical, HazardClass } from "@/core/types/ems";

import { daysUntil } from "./utils";

export function useChemicalFilters({
  search,
  companyId,
  hazard,
  approval,
  expiryFrom,
  expiryTo,
}: {
  search: string;
  companyId?: string;
  hazard?: string;
  approval?: string;
  expiryFrom: string;
  expiryTo: string;
}) {
  const expiryFromTs = expiryFrom ? new Date(expiryFrom).getTime() : undefined;
  const expiryToTs = expiryTo ? new Date(expiryTo).getTime() : undefined;
  const rows = chemicals
    .filter((chemical) => (companyId ? chemical.facilityId === companyId : true))
    .filter((chemical) => (hazard ? chemical.hazardClasses.includes(hazard as HazardClass) : true))
    .filter((chemical) => (approval ? chemical.approvalStatus === (approval as Chemical["approvalStatus"]) : true))
    .filter((chemical) => withinExpiryRange(chemical, expiryFromTs, expiryToTs))
    .filter((chemical) => matchesChemicalSearch(chemical, search));

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

function matchesChemicalSearch(chemical: Chemical, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return chemical.name.toLowerCase().includes(query) || chemical.supplier.toLowerCase().includes(query) || chemical.storageArea.toLowerCase().includes(query) || getFacilityName(chemical.facilityId).toLowerCase().includes(query);
}

function isNearExpiry(chemical: Chemical) {
  const days = daysUntil(chemical.expiryDate);
  return typeof days === "number" && days >= 0 && days <= 60;
}
