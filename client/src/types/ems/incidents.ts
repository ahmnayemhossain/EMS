import type { ID } from "@/types/ems/core";

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

