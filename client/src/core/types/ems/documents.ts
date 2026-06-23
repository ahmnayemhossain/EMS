import type { ID } from "@/core/types/ems/core";

export type Document = {
  id: ID;
  facilityId: ID;
  companyName?: string;
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
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  notes?: string;
  uploadedAt?: string;
  uploadedBy?: string;
};


