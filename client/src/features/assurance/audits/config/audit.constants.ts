import type { AuditFindingRecord } from "@/core/types/models/audit";

export const AREAS: Array<{ value: AuditFindingRecord["area"]; label: string }> = [
  { value: "wastewater", label: "Wastewater / ETP" },
  { value: "chemicals", label: "Chemicals" },
  { value: "waste", label: "Waste" },
  { value: "utilities", label: "Utilities" },
  { value: "documents", label: "Documents" },
  { value: "training", label: "Training" },
  { value: "general", label: "General" },
];
