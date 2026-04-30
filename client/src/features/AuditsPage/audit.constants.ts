import type { AuditFindingRecord } from "@/core/types/audit";

export const AUDITORS = [
  "User One (EMP-0001)",
  "User Two (EMP-0002)",
  "User Three (EMP-0003)",
  "User Four (EMP-0004)",
  "User Five (EMP-0005)",
  "User Six (EMP-0006)",
  "User Seven (EMP-0007)",
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

