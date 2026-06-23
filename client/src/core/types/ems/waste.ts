import type { ID } from "@/core/types/ems/core";

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
  notes?: string;
  files?: Array<{
    id?: number;
    name: string;
    storedName?: string;
    mimeType?: string;
    fileSize?: number;
    storagePath?: string;
    url?: string;
    uploadedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
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
  DO?: number;
  exceedance?: WastewaterMetric[];
  labReport?: {
    id?: number;
    fileName: string;
    storedName?: string;
    mimeType?: string;
    fileSize?: number;
    storagePath?: string;
    url?: string;
    uploadedAt: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};


