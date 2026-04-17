export type * from "@/types/ems/core";
export type * from "@/types/ems/utilities";
export type * from "@/types/ems/chemicals";
export type * from "@/types/ems/waste";
export type * from "@/types/ems/audits";
export type * from "@/types/ems/documents";
export type * from "@/types/ems/incidents";
export type * from "@/types/ems/report-box";
export type * from "@/types/ems/training";

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
