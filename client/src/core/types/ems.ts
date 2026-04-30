export type * from "@/core/types/ems/core";
export type * from "@/core/types/ems/utilities";
export type * from "@/core/types/ems/chemicals";
export type * from "@/core/types/ems/waste";
export type * from "@/core/types/ems/audits";
export type * from "@/core/types/ems/documents";
export type * from "@/core/types/ems/incidents";
export type * from "@/core/types/ems/report-box";
export type * from "@/core/types/ems/training";

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
