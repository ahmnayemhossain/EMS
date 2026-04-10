export type ID = string;

export type FacilityType =
  | "garments"
  | "knitting"
  | "dyeing_wet_processing"
  | "shoe"
  | "resort";

export type RiskLevel = "low" | "medium" | "high";

export type Group = {
  id: ID;
  name: string;
  country: string;
  timezone: string;
};

export type Facility = {
  id: ID;
  groupId: ID;
  name: string;
  code: string;
  type: FacilityType;
  location: {
    city: string;
    region: string;
    country: string;
  };
  riskLevel: RiskLevel;
  auditReadinessScore: number; // 0-100
  complianceScore: number; // 0-100
};

export type UtilityType =
  | "electricity"
  | "water"
  | "fuel"
  | "steam"
  | "refrigerant"
  | "other";

export type UtilityRecord = {
  id: ID;
  facilityId: ID;
  type: UtilityType;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  meterName: string;
  uom: "kWh" | "m3" | "L" | "kg" | "Nm3";
  value: number;
  baselineValue?: number;
  varianceFlag?: "normal" | "watch" | "high";
  remarks?: string;
  billFiles?: Array<{ name: string; uploadedAt: string }>;
};

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

export type FindingSeverity = "minor" | "major" | "critical";

export type Finding = {
  id: ID;
  auditId: ID;
  facilityId: ID;
  title: string;
  severity: FindingSeverity;
  area:
    | "utilities"
    | "wastewater"
    | "chemicals"
    | "waste"
    | "documents"
    | "training"
    | "general";
  status: "open" | "in_progress" | "closed";
  dueDate?: string;
};

export type Audit = {
  id: ID;
  facilityId: ID;
  name: string; // e.g. "ISO 14001 Internal Audit"
  date: string; // ISO date
  auditor: string;
  progress: number; // 0-100 checklist progress
  overallScore: number; // 0-100
  findingsCount: { minor: number; major: number; critical: number };
};

export type CAPA = {
  id: ID;
  facilityId: ID;
  title: string;
  owner: string;
  severity: FindingSeverity;
  status: "open" | "in_progress" | "pending_verification" | "closed" | "overdue";
  dueDate: string; // ISO date
  evidenceCount: number;
  relatedFindingId?: ID;
};

export type Document = {
  id: ID;
  facilityId: ID;
  title: string;
  category:
    | "permit"
    | "policy"
    | "procedure"
    | "report"
    | "certificate"
    | "contract";
  ownerDepartment: string;
  expiresOn?: string; // ISO date
  status: "valid" | "expiring" | "expired";
  fileName: string;
};

export type Incident = {
  id: ID;
  facilityId: ID;
  date: string; // ISO date
  title: string;
  type:
    | "spill"
    | "chemical_exposure"
    | "wastewater_exceedance"
    | "fire"
    | "near_miss";
  severity: "low" | "medium" | "high";
  status: "open" | "investigating" | "closed";
};

export type TrainingRecord = {
  id: ID;
  facilityId: ID;
  title: string;
  audience: string;
  completedOn: string; // ISO date
  nextDueOn?: string; // ISO date
  status: "complete" | "due_soon" | "overdue";
};

export type Notification = {
  id: ID;
  createdAt: string; // ISO date-time
  facilityId?: ID;
  tone: "info" | "warning" | "critical" | "compliant";
  title: string;
  description: string;
  read: boolean;
  actionTo?: string;
  actionLabel?: string;
};
