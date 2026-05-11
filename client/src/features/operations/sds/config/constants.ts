export const SDS_SECTION_DEFS = [
  { id: "1", title: "Identification" }, { id: "2", title: "Hazard(s) identification" }, { id: "3", title: "Composition / information on ingredients" }, { id: "4", title: "First-aid measures" },
  { id: "5", title: "Fire-fighting measures" }, { id: "6", title: "Accidental release measures" }, { id: "7", title: "Handling and storage" }, { id: "8", title: "Exposure controls / personal protection" },
  { id: "9", title: "Physical and chemical properties" }, { id: "10", title: "Stability and reactivity" }, { id: "11", title: "Toxicological information" }, { id: "12", title: "Ecological information" },
  { id: "13", title: "Disposal considerations" }, { id: "14", title: "Transport information" }, { id: "15", title: "Regulatory information" }, { id: "16", title: "Other information" },
] as const;

export const SDS_SECTION_TABS: Array<{ id: "1-4" | "5-8" | "9-12" | "13-16"; label: string; sectionIds: string[] }> = [
  { id: "1-4", label: "1-4", sectionIds: ["1", "2", "3", "4"] },
  { id: "5-8", label: "5-8", sectionIds: ["5", "6", "7", "8"] },
  { id: "9-12", label: "9-12", sectionIds: ["9", "10", "11", "12"] },
  { id: "13-16", label: "13-16", sectionIds: ["13", "14", "15", "16"] },
];
