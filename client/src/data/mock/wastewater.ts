import type { WastewaterRecord } from "@/types/ems";

import { facilities } from "./core";

const baseWastewater: WastewaterRecord[] = [
  { id: "ww_001", facilityId: "fac_dyeing_d", sampleDate: "2026-04-03", point: "outlet", pH: 9.2, COD: 290, BOD: 88, TSS: 110, exceedance: ["pH"], labReport: { fileName: "ETP_LabReport_2026-04-03.pdf", uploadedAt: "2026-04-04" } },
  { id: "ww_002", facilityId: "fac_dyeing_d", sampleDate: "2026-03-27", point: "outlet", pH: 7.4, COD: 210, BOD: 60, TSS: 88 },
  { id: "ww_003", facilityId: "fac_dyeing_d", sampleDate: "2026-03-20", point: "outlet", pH: 7.1, COD: 225, BOD: 64, TSS: 92 },
];

const wastewaterCompanyIds = facilities.filter((facility) => facility.type === "dyeing_wet_processing").map((facility) => facility.id);

const generatedWastewater = Array.from({ length: 22 }).map((_, index) => {
  const sampleDate = `2026-03-${String(1 + (index % 28)).padStart(2, "0")}`;
  const pH = Number((6.8 + ((index % 7) * 0.3)).toFixed(1));
  return { id: `ww_gen_${String(index + 1).padStart(3, "0")}`, facilityId: wastewaterCompanyIds[index % wastewaterCompanyIds.length] ?? "fac_dyeing_d", sampleDate, point: "outlet", pH, COD: 180 + (index % 9) * 12, BOD: 45 + (index % 8) * 6, TSS: 70 + (index % 10) * 5, exceedance: pH > 9 ? (["pH"] as const) : undefined, labReport: index % 3 === 0 ? { fileName: `ETP_LabReport_${sampleDate}.pdf`, uploadedAt: "2026-04-04" } : undefined } satisfies WastewaterRecord;
});

export const wastewaterRecords: WastewaterRecord[] = [...baseWastewater, ...generatedWastewater];
