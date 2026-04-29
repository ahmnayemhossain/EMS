import type { SDSRecord } from "@/types/ems";

import { makeSections } from "./sds-sections";

const sdsNames = [
  "Acetic Acid", "Sodium Hypochlorite", "Sodium Hydrosulfite", "Hydrochloric Acid (30%)", "Sulfuric Acid (98%)",
  "Sodium Carbonate (Soda Ash)", "Wetting Agent (Non-ionic)", "Reactive Dye (Blue)", "Dispersing Agent", "Antifoam (Silicone)",
  "Softener (Cationic)", "Enzyme (Desizing)", "Formaldehyde-free Resin", "Chelating Agent (EDTA)", "Polymer Flocculant",
  "Alum (Aluminum Sulfate)", "PAC (Polyaluminum Chloride)", "Activated Carbon", "PU Adhesive (Solvent-based)", "Detergent (Industrial)",
] as const;

export const generatedSdsRecords: SDSRecord[] = sdsNames.map((name, index) => ({
  id: `sds_gen_${String(index + 1).padStart(3, "0")}`,
  chemicalName: name,
  supplier: index % 3 === 0 ? "Delta Chemicals Ltd." : index % 3 === 1 ? "Nexa Trading" : "Kite Materials",
  language: "English",
  revisionDate: index % 2 === 0 ? "2026-01-15" : "2025-12-10",
  fileName: `SDS_${name.replace(/[^\w]+/g, "_")}_Rev.pdf`,
  sections: makeSections({ "1": `${name}; site-approved use in wet processing and ETP operations (as applicable).` }),
}));
