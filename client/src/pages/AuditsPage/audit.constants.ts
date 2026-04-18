import type { AuditFindingRecord } from "@/types/audit";

export const AUDITORS = [
  "Nayem (700901)",
  "Mehedi (70900)",
  "Nimur (700999)",
  "Munna (700902)",
  "Sakib (700903)",
  "Aminul (700905)",
  "Parvej (700906)",
] as const;

export const AREAS: Array<{ value: AuditFindingRecord["area"]; label: string }> = [
  { value: "wastewater", label: "Wastewater / ETP" },
  { value: "chemicals", label: "Chemicals" },
  { value: "waste", label: "Waste" },
  { value: "utilities", label: "Utilities" },
  { value: "documents", label: "Documents" },
  { value: "training", label: "Training" },
  { value: "general", label: "General" },
];

