import type { ID } from "@/types/ems/core";

export type HazardClass =
  | "corrosive"
  | "flammable"
  | "toxic"
  | "oxidizer"
  | "irritant"
  | "environmental_hazard"
  | "compressed_gas";

export type Chemical = {
  id: ID;
  facilityId: ID;
  name: string;
  tradeName?: string;
  supplier: string;
  storageArea: string;
  hazardClasses: HazardClass[];
  approvalStatus: "approved" | "pending" | "restricted";
  stockKg: number;
  minStockKg?: number;
  expiryDate?: string; // ISO date
  sdsId?: ID;
  ppe: string[];
  storageInstructions: string[];
  compatibilityWarnings: string[];
  linkedWasteStream?: string;
  batches?: Array<{ batchNo: string; receivedAt: string; qtyKg: number }>;
};

export type SDSRecord = {
  id: ID;
  chemicalName: string;
  supplier: string;
  language: string;
  revisionDate: string; // ISO date
  fileName: string;
  sections: Array<{ id: string; title: string; summary: string }>;
};

