import type { WasteRecord } from "@/core/types/models/ems";

import { facilities } from "./core";

const baseWasteRecords: WasteRecord[] = [
  { id: "w_001", facilityId: "fac_dyeing_d", date: "2026-04-02", stream: "ETP Sludge", type: "sludge", qtyKg: 8200, storageLocation: "Sludge yard", disposalStatus: "scheduled", vendor: "EcoTreat Services", dueBy: "2026-04-12" },
  { id: "w_002", facilityId: "fac_shoe_s", date: "2026-03-29", stream: "Used solvent (cleaning)", type: "hazardous", qtyKg: 420, storageLocation: "Haz waste store", disposalStatus: "stored", dueBy: "2026-04-15" },
  { id: "w_003", facilityId: "fac_garments_a", date: "2026-04-01", stream: "Cotton fabric scraps", type: "recyclable", qtyKg: 1350, storageLocation: "Recyclables bay", disposalStatus: "disposed", vendor: "Circular Fibers Ltd.", manifestNo: "CF-2026-0401-118" },
];

const wasteStreams = [{ stream: "ETP Sludge", type: "sludge" as const }, { stream: "Used Oil", type: "hazardous" as const }, { stream: "Used Solvent", type: "hazardous" as const }, { stream: "Paper & carton", type: "recyclable" as const }, { stream: "Plastic scrap", type: "recyclable" as const }, { stream: "Mixed general waste", type: "non_hazardous" as const }, { stream: "Chemical container (rinsed)", type: "recyclable" as const }, { stream: "E-waste (small electronics)", type: "e_waste" as const }] as const;
const wasteVendors = ["EcoTreat Services", "Circular Fibers Ltd.", "GreenHaul Logistics"] as const;

const generatedWasteRecords = Array.from({ length: 24 }).map((_, index) => {
  const facility = facilities[index % facilities.length];
  const stream = wasteStreams[index % wasteStreams.length];
  const date = `2026-03-${String(1 + (index % 28)).padStart(2, "0")}`;
  const disposalStatus = index % 5 === 0 ? "stored" : index % 5 === 1 ? "scheduled" : "disposed";
  return { id: `w_gen_${String(index + 1).padStart(3, "0")}`, facilityId: facility.id, date, stream: stream.stream, type: stream.type, qtyKg: 120 + (index % 9) * 180, storageLocation: stream.type === "hazardous" ? "Haz waste store" : stream.type === "sludge" ? "Sludge yard" : "Waste bay", disposalStatus, vendor: disposalStatus === "disposed" || disposalStatus === "scheduled" ? wasteVendors[index % wasteVendors.length] : undefined, manifestNo: disposalStatus === "disposed" ? `MF-${date.replaceAll("-", "")}-${100 + index}` : undefined, dueBy: disposalStatus !== "disposed" ? "2026-04-15" : undefined } satisfies WasteRecord;
});

export const wasteRecords: WasteRecord[] = [...baseWasteRecords, ...generatedWasteRecords];
