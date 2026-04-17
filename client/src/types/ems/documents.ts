import type { ID } from "@/types/ems/core";

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

