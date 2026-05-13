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


