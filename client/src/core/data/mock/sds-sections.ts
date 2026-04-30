export const sectionDefs = [
  { id: "1", title: "Identification", summary: "Product identifier, recommended use, supplier details." },
  { id: "2", title: "Hazard(s) identification", summary: "GHS classification, signal word, hazard statements." },
  { id: "3", title: "Composition / information on ingredients", summary: "Substances/mixtures, concentration ranges, CAS numbers." },
  { id: "4", title: "First-aid measures", summary: "First-aid instructions by exposure route; symptoms and effects." },
  { id: "5", title: "Fire-fighting measures", summary: "Suitable extinguishing media; special hazards; protective equipment." },
  { id: "6", title: "Accidental release measures", summary: "Spill response, containment, clean-up methods, PPE." },
  { id: "7", title: "Handling and storage", summary: "Safe handling precautions; storage conditions; incompatibilities." },
  { id: "8", title: "Exposure controls / personal protection", summary: "Exposure limits, engineering controls, PPE requirements." },
  { id: "9", title: "Physical and chemical properties", summary: "Appearance, odor, pH, flash point, solubility, etc." },
  { id: "10", title: "Stability and reactivity", summary: "Reactivity, stability, hazardous reactions, incompatible materials." },
  { id: "11", title: "Toxicological information", summary: "Routes of exposure; acute/chronic effects; sensitization." },
  { id: "12", title: "Ecological information", summary: "Ecotoxicity, persistence/degradability, bioaccumulation." },
  { id: "13", title: "Disposal considerations", summary: "Waste treatment methods; disposal restrictions and controls." },
  { id: "14", title: "Transport information", summary: "UN number, packing group, hazard class, marine pollutant info." },
  { id: "15", title: "Regulatory information", summary: "Safety/health/environment regulations specific to the product." },
  { id: "16", title: "Other information", summary: "Revision history and additional notes." },
] as const;

export function makeSections(overrides?: Partial<Record<string, string>>) {
  return sectionDefs.map((section) => ({ ...section, summary: overrides?.[section.id] ?? section.summary }));
}
