import type { Facility } from "@/core/types/models/ems";

export function FacilityHeaderActions({ facility }: { facility: Facility }) {
  return <div className="text-sm text-muted-foreground">{facility.name}</div>;
}
