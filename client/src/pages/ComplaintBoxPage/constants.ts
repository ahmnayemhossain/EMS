export const complaintCategories = [
  { value: "harassment", label: "Harassment" },
  { value: "abuse", label: "Gali / Abuse" },
  { value: "safety", label: "Safety" },
  { value: "environment", label: "Environment" },
  { value: "quality", label: "Quality" },
  { value: "wage", label: "Wage / Overtime" },
  { value: "other", label: "Other" },
] as const;

export type ComplaintCategory = (typeof complaintCategories)[number]["value"];

