import type { UtilityRecord } from "@/core/types/ems";

export function createStateFromRecord(record: UtilityRecord) {
  return {
    companyId: record.facilityId,
    type: record.type,
    meterId: record.meterId ? String(record.meterId) : "",
    meterName: record.meterName,
    periodStart: record.periodStart,
    periodEnd: record.periodEnd,
    previousReading: String(record.previousReading ?? ""),
    currentReading: String(record.currentReading ?? ""),
    consumptionInput: String(record.value ?? ""),
    dieselLitersInput: String(record.dieselLiters ?? ""),
    unit: record.uom,
    sourceId: record.sourceId ?? "",
    remarks: record.remarks ?? "",
    attachment: null,
  };
}
