import type {
  Audit,
  CAPA,
  Chemical,
  Document,
  Facility,
  Group,
  Incident,
  Notification,
  SDSRecord,
  TrainingRecord,
  UtilityRecord,
  WasteRecord,
  WastewaterRecord,
} from "@/types/ems";

export const group: Group = {
  id: "grp_greenstitch",
  name: "FORTIS GROUP",
  country: "Bangladesh",
  timezone: "Asia/Dhaka",
};

export const facilities: Facility[] = [
  {
    id: "fac_garments_a",
    groupId: group.id,
    name: "HFL",
    code: "HFL",
    type: "garments",
    location: { city: "Gazipur", region: "Dhaka Division", country: "Bangladesh" },
    riskLevel: "medium",
    auditReadinessScore: 82,
    complianceScore: 86,
  },
  {
    id: "fac_knitting_b",
    groupId: group.id,
    name: "QFL",
    code: "QFL",
    type: "knitting",
    location: { city: "Narayanganj", region: "Dhaka Division", country: "Bangladesh" },
    riskLevel: "medium",
    auditReadinessScore: 78,
    complianceScore: 80,
  },
  {
    id: "fac_dyeing_d",
    groupId: group.id,
    name: "FGL",
    code: "FGL",
    type: "dyeing_wet_processing",
    location: { city: "Gazipur", region: "Dhaka Division", country: "Bangladesh" },
    riskLevel: "high",
    auditReadinessScore: 68,
    complianceScore: 72,
  },
  {
    id: "fac_shoe_s",
    groupId: group.id,
    name: "AFL",
    code: "AFL",
    type: "shoe",
    location: { city: "Chattogram", region: "Chattogram Division", country: "Bangladesh" },
    riskLevel: "medium",
    auditReadinessScore: 74,
    complianceScore: 78,
  },
  {
    id: "fac_resort_r",
    groupId: group.id,
    name: "Sarah Resort",
    code: "SARAH",
    type: "resort",
    location: { city: "Cox’s Bazar", region: "Chattogram Division", country: "Bangladesh" },
    riskLevel: "low",
    auditReadinessScore: 88,
    complianceScore: 90,
  },
  {
    id: "fac_kadl",
    groupId: group.id,
    name: "KADL",
    code: "KADL",
    type: "dyeing_wet_processing",
    location: { city: "Gazipur", region: "Dhaka Division", country: "Bangladesh" },
    riskLevel: "high",
    auditReadinessScore: 71,
    complianceScore: 75,
  },
  {
    id: "fac_dt_resort",
    groupId: group.id,
    name: "Dowtown Resort",
    code: "DTR",
    type: "resort",
    location: { city: "Cox’s Bazar", region: "Chattogram Division", country: "Bangladesh" },
    riskLevel: "low",
    auditReadinessScore: 90,
    complianceScore: 92,
  },
  {
    id: "fac_rsbl",
    groupId: group.id,
    name: "RSBL",
    code: "RSBL",
    type: "garments",
    location: { city: "Savar", region: "Dhaka Division", country: "Bangladesh" },
    riskLevel: "medium",
    auditReadinessScore: 76,
    complianceScore: 79,
  },
];

export const utilityRecords: UtilityRecord[] = [
  {
    id: "util_001",
    facilityId: "fac_garments_a",
    type: "electricity",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    meterName: "Main incomer",
    uom: "kWh",
    value: 482_300,
    baselineValue: 460_000,
    varianceFlag: "watch",
    remarks: "Overtime batch orders in last week of March.",
    billFiles: [{ name: "GS-A_Electricity_Mar2026.pdf", uploadedAt: "2026-04-02" }],
  },
  {
    id: "util_002",
    facilityId: "fac_dyeing_d",
    type: "water",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    meterName: "Process water line",
    uom: "m3",
    value: 31_240,
    baselineValue: 28_900,
    varianceFlag: "high",
    remarks: "Higher reprocessing rate; check rinse optimization.",
  },
  {
    id: "util_003",
    facilityId: "fac_resort_r",
    type: "water",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    meterName: "Guest wing",
    uom: "m3",
    value: 1_980,
    baselineValue: 2_120,
    varianceFlag: "normal",
  },
  {
    id: "util_004",
    facilityId: "fac_knitting_b",
    type: "fuel",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    meterName: "Boiler feed",
    uom: "L",
    value: 18_700,
    baselineValue: 19_100,
    varianceFlag: "normal",
  },
  {
    id: "util_005",
    facilityId: "fac_shoe_s",
    type: "electricity",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    meterName: "Production floor",
    uom: "kWh",
    value: 154_600,
    baselineValue: 151_200,
    varianceFlag: "normal",
  },
  // Generated rows so each utility tab has at least 20 records
  ...(() => {
    const periods = [
      { start: "2026-01-01", end: "2026-01-31", label: "2026-01" },
      { start: "2026-02-01", end: "2026-02-28", label: "2026-02" },
      { start: "2026-03-01", end: "2026-03-31", label: "2026-03" },
    ] as const;

    const types = [
      { type: "electricity", meter: "Main incomer", uom: "kWh" as const, base: 160_000 },
      { type: "water", meter: "Process water", uom: "m3" as const, base: 5200 },
      { type: "fuel", meter: "Boiler feed", uom: "L" as const, base: 9800 },
      { type: "steam", meter: "Steam header", uom: "Nm3" as const, base: 4200 },
      { type: "refrigerant", meter: "Cold room", uom: "kg" as const, base: 48 },
      { type: "other", meter: "Compressed air", uom: "kWh" as const, base: 9200 },
    ] as const;

    const out: UtilityRecord[] = [];
    let n = 0;

    for (const p of periods) {
      for (const t of types) {
        for (const f of facilities) {
          const factor =
            f.type === "dyeing_wet_processing"
              ? 1.6
              : f.type === "garments"
                ? 1.2
                : f.type === "knitting"
                  ? 1.35
                  : f.type === "shoe"
                    ? 0.85
                    : 0.55;

          const jitter = ((f.id.length + p.label.length + t.type.length) % 9) / 100;
          const value = Math.round(t.base * factor * (1 + jitter));
          const baselineValue = Math.round(value * 0.97);
          const varianceFlag =
            f.id === "fac_dyeing_d" && t.type === "water" && p.label === "2026-03"
              ? "high"
              : value > baselineValue * 1.08
                ? "watch"
                : "normal";

          out.push({
            id: `util_gen_${p.label}_${t.type}_${++n}`,
            facilityId: f.id,
            type: t.type,
            periodStart: p.start,
            periodEnd: p.end,
            meterName: t.meter,
            uom: t.uom,
            value,
            baselineValue,
            varianceFlag,
            remarks:
              varianceFlag === "high"
                ? "Flagged variance; review process changes and attach bills."
                : undefined,
            billFiles:
              t.type === "electricity" && p.label === "2026-03"
                ? [{ name: `${f.code}_${t.type}_${p.label}.pdf`, uploadedAt: "2026-04-03" }]
                : undefined,
          });
        }
      }
    }

    return out;
  })(),
];

export const sdsRecords: SDSRecord[] = [
  // Standard SDS structure (16 sections)
  // https://www.osha.gov/publications/sds is the common reference, but we keep copy minimal here for UI mock data.
  // Sections are used across preview + drawer edit UI.
  ...(() => {
    const sectionDefs: Array<{ id: string; title: string; summary: string }> = [
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
    ];

    const makeSections = (overrides?: Partial<Record<string, string>>) =>
      sectionDefs.map((s) => ({
        ...s,
        summary: overrides?.[s.id] ?? s.summary,
      }));

    const base: SDSRecord[] = [
      {
        id: "sds_001",
        chemicalName: "Hydrogen Peroxide (50%)",
        supplier: "Delta Chemicals Ltd.",
        language: "English",
        revisionDate: "2025-11-10",
        fileName: "SDS_H2O2_50_Delta_2025-11.pdf",
        sections: makeSections({
          "2": "Oxidizer; causes severe burns and eye damage. Keep away from organics and reducers.",
          "6": "Isolate area. Dike to contain. Flush small spills with water where permitted; avoid drains.",
          "7": "Keep cool and ventilated. Use compatible containers; avoid contamination with metals/dyes.",
          "8": "Face shield, chemical goggles, nitrile gloves, apron; local exhaust ventilation.",
          "14": "UN 2014; Hydrogen peroxide, aqueous solution; Class 5.1 (Oxidizer).",
          "16": "Updated exposure controls and handling guidance.",
        }),
      },
      {
        id: "sds_002",
        chemicalName: "Caustic Soda (Flakes)",
        supplier: "Nexa Trading",
        language: "English",
        revisionDate: "2026-01-05",
        fileName: "SDS_NaOH_Nexa_2026-01.pdf",
        sections: makeSections({
          "1": "Sodium hydroxide; cleaning, scouring, and pH adjustment. Emergency contact available.",
          "2": "Corrosive. Causes severe skin burns and eye damage.",
          "6": "Avoid dust. Sweep up dry material carefully. Neutralize residues where allowed.",
          "7": "Keep dry. Store in corrosion-resistant containers; avoid aluminum and zinc.",
          "8": "Goggles/face shield, gloves, apron; eyewash and safety shower required.",
          "14": "UN 1823; Sodium hydroxide, solid; Class 8 (Corrosive).",
        }),
      },
    ];

    // Generated rows so SDS list has at least 20 records
    const generated = (() => {
      const names = [
        "Acetic Acid",
        "Sodium Hypochlorite",
        "Sodium Hydrosulfite",
        "Hydrochloric Acid (30%)",
        "Sulfuric Acid (98%)",
        "Sodium Carbonate (Soda Ash)",
        "Wetting Agent (Non-ionic)",
        "Reactive Dye (Blue)",
        "Dispersing Agent",
        "Antifoam (Silicone)",
        "Softener (Cationic)",
        "Enzyme (Desizing)",
        "Formaldehyde-free Resin",
        "Chelating Agent (EDTA)",
        "Polymer Flocculant",
        "Alum (Aluminum Sulfate)",
        "PAC (Polyaluminum Chloride)",
        "Activated Carbon",
        "PU Adhesive (Solvent-based)",
        "Detergent (Industrial)",
      ] as const;

      return names.map((n, idx) => ({
        id: `sds_gen_${String(idx + 1).padStart(3, "0")}`,
        chemicalName: n,
        supplier:
          idx % 3 === 0
            ? "Delta Chemicals Ltd."
            : idx % 3 === 1
              ? "Nexa Trading"
              : "Kite Materials",
        language: "English",
        revisionDate: idx % 2 === 0 ? "2026-01-15" : "2025-12-10",
        fileName: `SDS_${n.replace(/[^\w]+/g, "_")}_Rev.pdf`,
        sections: makeSections({
          "1": `${n}; site-approved use in wet processing and ETP operations (as applicable).`,
        }),
      }));
    })();

    return [...base, ...generated];
  })(),
];

export const chemicals: Chemical[] = [
  {
    id: "chem_001",
    facilityId: "fac_dyeing_d",
    name: "Hydrogen Peroxide (50%)",
    supplier: "Delta Chemicals Ltd.",
    storageArea: "Oxidizer store",
    hazardClasses: ["oxidizer", "corrosive", "environmental_hazard"],
    approvalStatus: "approved",
    stockKg: 1240,
    expiryDate: "2026-07-15",
    sdsId: "sds_001",
    ppe: ["Face shield", "Nitrile gloves", "Apron", "Closed shoes"],
    storageInstructions: ["Keep away from heat", "Use vented caps", "Avoid organic contamination"],
    compatibilityWarnings: ["Do not store with reducers", "Keep away from metals and dyes"],
    linkedWasteStream: "ETP sludge",
    batches: [
      { batchNo: "H2O2-26-0321", receivedAt: "2026-03-21", qtyKg: 620 },
      { batchNo: "H2O2-26-0308", receivedAt: "2026-03-08", qtyKg: 680 },
    ],
  },
  {
    id: "chem_002",
    facilityId: "fac_dyeing_d",
    name: "Caustic Soda (Flakes)",
    supplier: "Nexa Trading",
    storageArea: "Alkali store",
    hazardClasses: ["corrosive"],
    approvalStatus: "approved",
    stockKg: 4200,
    minStockKg: 2500,
    sdsId: "sds_002",
    ppe: ["Safety goggles", "Rubber gloves", "Apron"],
    storageInstructions: ["Keep dry", "Use sealed containers", "Store on pallets"],
    compatibilityWarnings: ["Avoid acids", "Avoid aluminum and zinc"],
    linkedWasteStream: "Neutralization sludge",
  },
  {
    id: "chem_003",
    facilityId: "fac_shoe_s",
    name: "Solvent-based Adhesive (PU)",
    supplier: "Kite Materials",
    storageArea: "Adhesive cabinet",
    hazardClasses: ["flammable", "irritant"],
    approvalStatus: "restricted",
    stockKg: 680,
    expiryDate: "2026-05-05",
    ppe: ["Respirator (organic vapor)", "Gloves", "Safety glasses"],
    storageInstructions: ["Keep away from ignition sources", "Bond cabinet grounding"],
    compatibilityWarnings: ["Do not store with oxidizers"],
    linkedWasteStream: "Hazardous solvent waste",
  },
  // Generated rows so inventory has at least 20 chemicals
  ...(() => {
    const items = [
      { name: "Acetic Acid", hazardClasses: ["corrosive"] as const, supplier: "Delta Chemicals Ltd." },
      { name: "Sodium Hypochlorite (12%)", hazardClasses: ["corrosive", "environmental_hazard"] as const, supplier: "Nexa Trading" },
      { name: "Hydrochloric Acid (30%)", hazardClasses: ["corrosive"] as const, supplier: "Delta Chemicals Ltd." },
      { name: "Sulfuric Acid (98%)", hazardClasses: ["corrosive"] as const, supplier: "Delta Chemicals Ltd." },
      { name: "Sodium Hydrosulfite", hazardClasses: ["flammable", "toxic"] as const, supplier: "Nexa Trading" },
      { name: "Reactive Dye (Blue)", hazardClasses: ["irritant"] as const, supplier: "Kite Materials" },
      { name: "Wetting Agent (Non-ionic)", hazardClasses: ["irritant"] as const, supplier: "Kite Materials" },
      { name: "Antifoam (Silicone)", hazardClasses: ["irritant"] as const, supplier: "Kite Materials" },
      { name: "PAC (Polyaluminum Chloride)", hazardClasses: ["corrosive"] as const, supplier: "Nexa Trading" },
      { name: "Alum (Aluminum Sulfate)", hazardClasses: ["irritant"] as const, supplier: "Nexa Trading" },
      { name: "Polymer Flocculant", hazardClasses: ["irritant"] as const, supplier: "Kite Materials" },
      { name: "Activated Carbon", hazardClasses: ["irritant"] as const, supplier: "Kite Materials" },
      { name: "Industrial Detergent", hazardClasses: ["irritant"] as const, supplier: "Nexa Trading" },
      { name: "Glass Cleaner (Ammonia)", hazardClasses: ["toxic", "irritant"] as const, supplier: "Delta Chemicals Ltd." },
      { name: "Boiler Treatment Chemical", hazardClasses: ["corrosive"] as const, supplier: "Delta Chemicals Ltd." },
      { name: "Cooling Tower Biocide", hazardClasses: ["toxic", "environmental_hazard"] as const, supplier: "Nexa Trading" },
      { name: "Lubricant Oil", hazardClasses: ["environmental_hazard"] as const, supplier: "Kite Materials" },
      { name: "Solvent Thinner", hazardClasses: ["flammable", "toxic"] as const, supplier: "Kite Materials" },
      { name: "Soda Ash (Sodium Carbonate)", hazardClasses: ["irritant"] as const, supplier: "Nexa Trading" },
      { name: "Caustic Soda (Solution)", hazardClasses: ["corrosive"] as const, supplier: "Nexa Trading" },
    ] as const;

    const factoriesForChem = facilities.filter((f) => f.type !== "resort");

    return items.map((it, idx) => {
      const f = factoriesForChem[idx % factoriesForChem.length];
      const approvalStatus =
        idx % 11 === 0 ? "restricted" : idx % 7 === 0 ? "pending" : "approved";
      const sdsId =
        idx % 4 === 0
          ? "sds_001"
          : idx % 4 === 1
            ? "sds_002"
            : `sds_gen_${String((idx % 20) + 1).padStart(3, "0")}`;

      return {
        id: `chem_gen_${String(idx + 1).padStart(3, "0")}`,
        facilityId: f.id,
        name: it.name,
        supplier: it.supplier,
        storageArea: f.type === "shoe" ? "Chemical cabinet" : "Main chemical store",
        hazardClasses: it.hazardClasses as unknown as Chemical["hazardClasses"],
        approvalStatus,
        stockKg: 120 + (idx % 9) * 75,
        expiryDate: idx % 3 === 0 ? "2026-05-20" : "2026-10-10",
        sdsId,
        ppe: ["Gloves", "Safety goggles", "Apron"],
        storageInstructions: ["Keep containers closed", "Store in ventilated area"],
        compatibilityWarnings: ["Avoid incompatible materials", "Follow SDS segregation guidance"],
        linkedWasteStream: approvalStatus === "restricted" ? "Hazardous waste" : "General waste",
      } satisfies Chemical;
    });
  })(),
];

export const wastewaterRecords: WastewaterRecord[] = [
  {
    id: "ww_001",
    facilityId: "fac_dyeing_d",
    sampleDate: "2026-04-03",
    point: "outlet",
    pH: 9.2,
    COD: 290,
    BOD: 88,
    TSS: 110,
    exceedance: ["pH"],
    labReport: { fileName: "ETP_LabReport_2026-04-03.pdf", uploadedAt: "2026-04-04" },
  },
  {
    id: "ww_002",
    facilityId: "fac_dyeing_d",
    sampleDate: "2026-03-27",
    point: "outlet",
    pH: 7.4,
    COD: 210,
    BOD: 60,
    TSS: 88,
  },
  {
    id: "ww_003",
    facilityId: "fac_dyeing_d",
    sampleDate: "2026-03-20",
    point: "outlet",
    pH: 7.1,
    COD: 225,
    BOD: 64,
    TSS: 92,
  },
  // Generated rows so lab table has at least 20 records
  ...(() => {
    const factoryIds = facilities
      .filter((f) => f.type === "dyeing_wet_processing")
      .map((f) => f.id);
    const out: WastewaterRecord[] = [];
    for (let i = 0; i < 22; i++) {
      const facilityId = factoryIds[i % factoryIds.length] ?? "fac_dyeing_d";
      const day = String(1 + (i % 28)).padStart(2, "0");
      const sampleDate = `2026-03-${day}`;
      const pH = 6.8 + ((i % 7) * 0.3);
      const COD = 180 + (i % 9) * 12;
      const BOD = 45 + (i % 8) * 6;
      const TSS = 70 + (i % 10) * 5;
      const exceedance = pH > 9.0 ? (["pH"] as const) : undefined;
      out.push({
        id: `ww_gen_${String(i + 1).padStart(3, "0")}`,
        facilityId,
        sampleDate,
        point: "outlet",
        pH: Number(pH.toFixed(1)),
        COD,
        BOD,
        TSS,
        exceedance: exceedance as unknown as WastewaterRecord["exceedance"],
        labReport:
          i % 3 === 0
            ? { fileName: `ETP_LabReport_${sampleDate}.pdf`, uploadedAt: "2026-04-04" }
            : undefined,
      });
    }
    return out;
  })(),
];

export const wasteRecords: WasteRecord[] = [
  {
    id: "w_001",
    facilityId: "fac_dyeing_d",
    date: "2026-04-02",
    stream: "ETP Sludge",
    type: "sludge",
    qtyKg: 8200,
    storageLocation: "Sludge yard",
    disposalStatus: "scheduled",
    vendor: "EcoTreat Services",
    dueBy: "2026-04-12",
  },
  {
    id: "w_002",
    facilityId: "fac_shoe_s",
    date: "2026-03-29",
    stream: "Used solvent (cleaning)",
    type: "hazardous",
    qtyKg: 420,
    storageLocation: "Haz waste store",
    disposalStatus: "stored",
    dueBy: "2026-04-15",
  },
  {
    id: "w_003",
    facilityId: "fac_garments_a",
    date: "2026-04-01",
    stream: "Cotton fabric scraps",
    type: "recyclable",
    qtyKg: 1350,
    storageLocation: "Recyclables bay",
    disposalStatus: "disposed",
    vendor: "Circular Fibers Ltd.",
    manifestNo: "CF-2026-0401-118",
  },
  // Generated rows so waste table has at least 20 records
  ...(() => {
    const streams = [
      { stream: "ETP Sludge", type: "sludge" as const },
      { stream: "Used Oil", type: "hazardous" as const },
      { stream: "Used Solvent", type: "hazardous" as const },
      { stream: "Paper & carton", type: "recyclable" as const },
      { stream: "Plastic scrap", type: "recyclable" as const },
      { stream: "Mixed general waste", type: "non_hazardous" as const },
      { stream: "Chemical container (rinsed)", type: "recyclable" as const },
      { stream: "E-waste (small electronics)", type: "e_waste" as const },
    ] as const;

    const vendors = ["EcoTreat Services", "Circular Fibers Ltd.", "GreenHaul Logistics"] as const;
    const out: WasteRecord[] = [];
    for (let i = 0; i < 24; i++) {
      const f = facilities[i % facilities.length];
      const s = streams[i % streams.length];
      const day = String(1 + (i % 28)).padStart(2, "0");
      const date = `2026-03-${day}`;
      const disposalStatus = i % 5 === 0 ? "stored" : i % 5 === 1 ? "scheduled" : "disposed";
      out.push({
        id: `w_gen_${String(i + 1).padStart(3, "0")}`,
        facilityId: f.id,
        date,
        stream: s.stream,
        type: s.type,
        qtyKg: 120 + (i % 9) * 180,
        storageLocation: s.type === "hazardous" ? "Haz waste store" : s.type === "sludge" ? "Sludge yard" : "Waste bay",
        disposalStatus,
        vendor: disposalStatus === "disposed" || disposalStatus === "scheduled" ? vendors[i % vendors.length] : undefined,
        manifestNo: disposalStatus === "disposed" ? `MF-${date.replaceAll("-", "")}-${100 + i}` : undefined,
        dueBy: disposalStatus !== "disposed" ? "2026-04-15" : undefined,
      });
    }
    return out;
  })(),
];

export const audits: Audit[] = [
  {
    id: "aud_001",
    facilityId: "fac_garments_a",
    name: "ISO 14001 Internal Audit",
    date: "2026-04-22",
    auditor: "Mehedi (70900)",
    progress: 55,
    overallScore: 84,
    findingsCount: { minor: 6, major: 1, critical: 0 },
  },
  {
    id: "aud_002",
    facilityId: "fac_dyeing_d",
    name: "Buyer Environmental Audit (Pre-check)",
    date: "2026-04-16",
    auditor: "Nimur (700999)",
    progress: 40,
    overallScore: 72,
    findingsCount: { minor: 9, major: 3, critical: 1 },
  },
];

export const capas: CAPA[] = [
  {
    id: "capa_001",
    facilityId: "fac_dyeing_d",
    title: "ETP outlet pH exceedance — dosing control tuning",
    owner: "Munna (700902)",
    severity: "major",
    status: "overdue",
    dueDate: "2026-04-08",
    evidenceCount: 2,
  },
  {
    id: "capa_002",
    facilityId: "fac_garments_a",
    title: "Update waste segregation signage in loading bay",
    owner: "Sakib (700903)",
    severity: "minor",
    status: "in_progress",
    dueDate: "2026-04-18",
    evidenceCount: 1,
  },
  {
    id: "capa_003",
    facilityId: "fac_shoe_s",
    title: "Restricted adhesive approval — substitute review",
    owner: "Aminul (700905)",
    severity: "major",
    status: "open",
    dueDate: "2026-04-25",
    evidenceCount: 0,
  },
];

export const documents: Document[] = [
  {
    id: "doc_001",
    facilityId: "fac_dyeing_d",
    title: "DoE Discharge Permit",
    category: "permit",
    ownerDepartment: "EHS (Parvej 700906)",
    expiresOn: "2026-04-30",
    status: "expiring",
    fileName: "DoE_Discharge_Permit_FGL_2025-2026.pdf",
  },
  {
    id: "doc_002",
    facilityId: "fac_garments_a",
    title: "Hazardous Waste Vendor Contract",
    category: "contract",
    ownerDepartment: "Admin (Sakib 700903)",
    expiresOn: "2026-03-31",
    status: "expired",
    fileName: "HazWaste_Contract_HFL_2025.pdf",
  },
  {
    id: "doc_003",
    facilityId: "fac_resort_r",
    title: "Water Quality Test Report (Quarterly)",
    category: "report",
    ownerDepartment: "Operations (Nayem 700901)",
    status: "valid",
    fileName: "Water_Test_Q1_2026_SarahResort.pdf",
  },
];

export const incidents: Incident[] = [
  {
    id: "inc_001",
    facilityId: "fac_dyeing_d",
    date: "2026-04-03",
    title: "ETP outlet pH high (lab confirm)",
    type: "wastewater_exceedance",
    severity: "high",
    status: "investigating",
  },
  {
    id: "inc_002",
    facilityId: "fac_shoe_s",
    date: "2026-03-26",
    title: "Minor solvent spill near bonding line",
    type: "spill",
    severity: "medium",
    status: "closed",
  },
];

export const trainingRecords: TrainingRecord[] = [
  {
    id: "tr_001",
    facilityId: "fac_garments_a",
    title: "Waste segregation & labeling",
    audience: "Production supervisors",
    completedOn: "2026-02-18",
    nextDueOn: "2027-02-18",
    status: "complete",
  },
  {
    id: "tr_002",
    facilityId: "fac_dyeing_d",
    title: "Chemical handling & PPE (wet processing)",
    audience: "Dyeing floor operators",
    completedOn: "2025-04-10",
    nextDueOn: "2026-04-10",
    status: "due_soon",
  },
];

export const notifications: Notification[] = [
  {
    id: "not_001",
    createdAt: "2026-04-08T09:20:00+06:00",
    facilityId: "fac_dyeing_d",
    tone: "critical",
    title: "Wastewater exceedance requires CAPA",
    description: "Outlet pH exceeded threshold in latest lab report. Create corrective action and attach evidence.",
    read: false,
    actionTo: "/wastewater",
    actionLabel: "Open wastewater",
  },
  {
    id: "not_002",
    createdAt: "2026-04-07T15:10:00+06:00",
    facilityId: "fac_garments_a",
    tone: "warning",
    title: "Permit expiring soon",
    description: "DoE Discharge Permit for FGL expires on 2026-04-30. Start renewal workflow.",
    read: true,
    actionTo: "/documents",
    actionLabel: "Open documents",
  },
  {
    id: "not_003",
    createdAt: "2026-04-06T10:05:00+06:00",
    tone: "info",
    title: "Monthly utilities review ready",
    description: "March utilities records imported. Review variance flags and attach missing bills.",
    read: true,
    actionTo: "/utilities",
    actionLabel: "Open utilities",
  },
];

export function getFacilityById(id: string) {
  return facilities.find((f) => f.id === id);
}

export function getFacilityName(id: string) {
  return getFacilityById(id)?.name ?? "Unknown factory";
}
