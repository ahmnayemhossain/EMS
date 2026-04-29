import { fileToBase64 } from "@/app/lib/api";
import { toast } from "@/app/lib/toast";

import { createUtilityRecord, deleteUtilityRecord, updateUtilityRecord, uploadUtilityAttachment, type UtilityRecordInput } from "@/pages/UtilitiesPage/api";
import type { UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import type { UtilityRecord } from "@/types/ems";

function toVarianceFlag(status: UtilityUsagePayload["status"]) {
  return status === "alert" || status === "high" ? "high" : status === "watch" ? "watch" : "normal";
}

function toRecordInput(payload: UtilityUsagePayload): UtilityRecordInput {
  return { facilityId: payload.companyId, type: payload.utilityType, meterName: payload.meterName, sourceId: payload.sourceId, periodStart: payload.periodStart, periodEnd: payload.periodEnd, previousReading: payload.previousReading, currentReading: payload.currentReading, uom: payload.unit, value: payload.consumption, baselineValue: payload.baselineValue, minThreshold: payload.minThreshold, maxThreshold: payload.maxThreshold, variance: payload.variance, variancePercent: payload.variancePercent, varianceFlag: toVarianceFlag(payload.status), status: payload.status, remarks: payload.remarks };
}

async function attachPdf(record: UtilityRecord, attachment: File, userId: string) {
  return uploadUtilityAttachment(record.id, { fileName: attachment.name, mimeType: attachment.type, dataBase64: await fileToBase64(attachment) }, userId);
}

export function createUtilityActions(input: { userId: string; selected: UtilityRecord | null; setSelected: (record: UtilityRecord | null) => void; setDeleteOpen: (open: boolean) => void; setUtilityRows: React.Dispatch<React.SetStateAction<UtilityRecord[]>>; }) {
  return {
    async createUsage(payload: UtilityUsagePayload) {
      try {
        let created = await createUtilityRecord(toRecordInput(payload), input.userId);
        if (payload.attachment) { try { created = await attachPdf(created, payload.attachment, input.userId); } catch (error) { input.setUtilityRows((current) => [created, ...current]); toast.error(error instanceof Error ? `Usage saved, but PDF upload failed: ${error.message}` : "Usage saved, but PDF upload failed."); return true; } }
        input.setUtilityRows((current) => [created, ...current]); toast.success("Utility usage saved"); return true;
      } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to save utility usage."); return false; }
    },
    async updateUsage(payload: UtilityUsagePayload) {
      if (!input.selected) return false;
      try {
        let updated = await updateUtilityRecord(input.selected.id, toRecordInput(payload), input.userId);
        if (payload.attachment) { try { updated = await attachPdf(updated, payload.attachment, input.userId); } catch (error) { input.setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row))); input.setSelected(updated); toast.error(error instanceof Error ? `Usage updated, but PDF upload failed: ${error.message}` : "Usage updated, but PDF upload failed."); return true; } }
        input.setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row))); input.setSelected(updated); toast.success("Utility usage updated"); return true;
      } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update utility usage."); return false; }
    },
    async deleteSelected() {
      if (!input.selected) return;
      try { await deleteUtilityRecord(input.selected.id, input.userId); input.setUtilityRows((current) => current.filter((row) => row.id !== input.selected?.id)); input.setSelected(null); input.setDeleteOpen(false); toast.success("Utility usage deleted"); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete utility usage."); }
    },
  };
}
