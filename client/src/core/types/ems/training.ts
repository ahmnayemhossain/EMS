import type { ID } from "@/core/types/ems/core";

export type TrainingRecord = {
  id: ID;
  facilityId: ID;
  title: string;
  audience: string;
  completedOn: string; // ISO date
  nextDueOn?: string; // ISO date
  status: "complete" | "due_soon" | "overdue";
};

