import type { SDSRecord } from "@/types/ems";

import { makeSections } from "./sds-sections";

export const baseSdsRecords: SDSRecord[] = [
  { id: "sds_001", chemicalName: "Hydrogen Peroxide (50%)", supplier: "Delta Chemicals Ltd.", language: "English", revisionDate: "2025-11-10", fileName: "SDS_H2O2_50_Delta_2025-11.pdf", sections: makeSections({ "2": "Oxidizer; causes severe burns and eye damage. Keep away from organics and reducers.", "6": "Isolate area. Dike to contain. Flush small spills with water where permitted; avoid drains.", "7": "Keep cool and ventilated. Use compatible containers; avoid contamination with metals/dyes.", "8": "Face shield, chemical goggles, nitrile gloves, apron; local exhaust ventilation.", "14": "UN 2014; Hydrogen peroxide, aqueous solution; Class 5.1 (Oxidizer).", "16": "Updated exposure controls and handling guidance." }) },
  { id: "sds_002", chemicalName: "Caustic Soda (Flakes)", supplier: "Nexa Trading", language: "English", revisionDate: "2026-01-05", fileName: "SDS_NaOH_Nexa_2026-01.pdf", sections: makeSections({ "1": "Sodium hydroxide; cleaning, scouring, and pH adjustment. Emergency contact available.", "2": "Corrosive. Causes severe skin burns and eye damage.", "6": "Avoid dust. Sweep up dry material carefully. Neutralize residues where allowed.", "7": "Keep dry. Store in corrosion-resistant containers; avoid aluminum and zinc.", "8": "Goggles/face shield, gloves, apron; eyewash and safety shower required.", "14": "UN 1823; Sodium hydroxide, solid; Class 8 (Corrosive)." }) },
];
