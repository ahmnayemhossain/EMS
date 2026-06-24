import type { Document } from "@/core/types/models/ems";

export const DOCUMENT_CATEGORIES: Array<{ value: Document["category"]; label: string }> = [
  { value: "permit", label: "Permit" },
  { value: "policy", label: "Policy" },
  { value: "procedure", label: "Procedure" },
  { value: "report", label: "Report" },
  { value: "certificate", label: "Certificate" },
  { value: "contract", label: "Contract" },
];
