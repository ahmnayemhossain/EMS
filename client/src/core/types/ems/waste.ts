import type { ID } from "@/core/types/models/ems/core";

export type WasteType =
  | "hazardous"
  | "non_hazardous"
  | "recyclable"
  | "sludge"
  | "e_waste";

export type WasteRecord = {
  id: ID;
  facilityId: ID;
  date: string; // ISO date
  stream: string; // e.g. "ETP Sludge", "Used Oil"
  type: WasteType;
  qtyKg: number;
  storageLocation: string;
  vendor?: string;
  disposalStatus: "stored" | "scheduled" | "disposed";
  manifestNo?: string;
  dueBy?: string; // ISO date
};

export type WastewaterMetric = "pH" | "COD" | "BOD" | "TSS" | "DO";

export type WastewaterRecord = {
  id: ID;
  facilityId: ID;
  sampleDate: string; // ISO date
  point: "inlet" | "outlet";
  pH: number;
  COD: number;
  BOD: number;
  TSS: number;
  exceedance?: WastewaterMetric[];
  labReport?: { fileName: string; uploadedAt: string };
};

