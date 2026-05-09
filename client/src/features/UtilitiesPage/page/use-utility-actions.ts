import { fileToBase64 } from "@/core/app/lib/api";
import { toast } from "@/core/app/lib/toast";

import { approveUtilityMonth, createUtilityRecord, deleteUtilityRecord, submitUtilityMonth, updateUtilityRecord, uploadUtilityAttachment, type UtilityRecordInput } from "@/features/UtilitiesPage/api";
import type { UtilityUsagePayload } from "@/features/UtilitiesPage/baseline-settings";
import type { UtilityRecord } from "@/core/types/ems";

function toVarianceFlag(status: UtilityUsagePayload["status"]) {
  return status === "alert" || status === "high" ? "high" : status === "watch" ? "watch" : "normal";
}

function toRecordInput(payload: UtilityUsagePayload): UtilityRecordInput {
  return { facilityId: payload.companyId, type: payload.utilityType, meterId: payload.meterId ? Number(payload.meterId) : undefined, meterName: payload.meterName, sourceId: payload.sourceId, periodStart: payload.periodStart, periodEnd: payload.periodEnd, previousReading: payload.previousReading, currentReading: payload.currentReading, dieselLiters: payload.dieselLiters, uom: payload.unit, value: payload.consumption, baselineValue: payload.baselineValue, minThreshold: payload.minThreshold, maxThreshold: payload.maxThreshold, variance: payload.variance, variancePercent: payload.variancePercent, varianceFlag: toVarianceFlag(payload.status), status: payload.status, remarks: payload.remarks };
}

function getCoverageWarning(record: UtilityRecord) {
  const missingDaysCount = Number(record.missingDaysCount || 0);
  if (missingDaysCount <= 0) return "";
  const missingLabel = (record.missingRanges || [])
    .map((item) => (item.start === item.end ? item.start : `${item.start} to ${item.end}`))
    .join(", ");
  return `Coverage warning: ${missingDaysCount} day${missingDaysCount === 1 ? "" : "s"} missing (${missingLabel || "check month coverage"}).`;
}

async function attachPdf(record: UtilityRecord, attachment: File, userId: string) {
  return uploadUtilityAttachment(record.id, { fileName: attachment.name, mimeType: attachment.type, dataBase64: await fileToBase64(attachment) }, userId);
}

export function createUtilityActions(input: { userId: string; selected: UtilityRecord | null; setSelected: (record: UtilityRecord | null) => void; setDeleteOpen: (open: boolean) => void; setUtilityRows: React.Dispatch<React.SetStateAction<UtilityRecord[]>>; reloadUtilities?: () => Promise<void>; }) {
  return {
    async createUsage(payload: UtilityUsagePayload) {
      try {
        let created = await createUtilityRecord(toRecordInput(payload), input.userId);
        if (payload.attachment) { try { created = await attachPdf(created, payload.attachment, input.userId); } catch (error) { input.setUtilityRows((current) => [created, ...current]); toast.error(error instanceof Error ? `Usage saved, but PDF upload failed: ${error.message}` : "Usage saved, but PDF upload failed."); return true; } }
        input.setUtilityRows((current) => [created, ...current]); await input.reloadUtilities?.(); const coverageWarning = getCoverageWarning(created); if (coverageWarning) toast.successDetail("Utility usage saved", coverageWarning); else toast.success("Utility usage saved"); return true;
      } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to save utility usage."); return false; }
    },
    async updateUsage(payload: UtilityUsagePayload) {
      if (!input.selected) return false;
      try {
        let updated = await updateUtilityRecord(input.selected.id, toRecordInput(payload), input.userId);
        if (payload.attachment) { try { updated = await attachPdf(updated, payload.attachment, input.userId); } catch (error) { input.setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row))); input.setSelected(updated); toast.error(error instanceof Error ? `Usage updated, but PDF upload failed: ${error.message}` : "Usage updated, but PDF upload failed."); return true; } }
        input.setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row))); input.setSelected(updated); await input.reloadUtilities?.(); const coverageWarning = getCoverageWarning(updated); if (coverageWarning) toast.successDetail("Utility usage updated", coverageWarning); else toast.success("Utility usage updated"); return true;
      } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update utility usage."); return false; }
    },
    async approveSelectedMonth() {
      if (!input.selected) return false;
      try {
        const approved = await approveUtilityMonth(input.selected.id, input.userId);
        input.setUtilityRows((current) => current.map((row) => row.periodMonth === approved.periodMonth && row.meterKey === approved.meterKey && row.type === approved.type && row.facilityId === approved.facilityId ? { ...row, approvalStatus: approved.approvalStatus, approvedBy: approved.approvedBy, approvedAt: approved.approvedAt, monthComplete: approved.monthComplete, missingRanges: approved.missingRanges, missingDaysCount: approved.missingDaysCount, coverageStart: approved.coverageStart, coverageEnd: approved.coverageEnd, coverageDays: approved.coverageDays, monthDays: approved.monthDays, monthRecordCount: approved.monthRecordCount, monthTotalValue: approved.monthTotalValue, monthTotalDieselLiters: approved.monthTotalDieselLiters } : row));
        input.setSelected(approved);
        await input.reloadUtilities?.();
        toast.success("Monthly utility data approved");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to approve monthly utility data.");
        return false;
      }
    },
    async submitSelectedMonth() {
      if (!input.selected) return false;
      try {
        const submitted = await submitUtilityMonth(input.selected.id, input.userId);
        input.setUtilityRows((current) =>
          current.map((row) =>
            row.periodMonth === submitted.periodMonth &&
            row.meterKey === submitted.meterKey &&
            row.type === submitted.type &&
            row.facilityId === submitted.facilityId
              ? { ...row, approvalStatus: submitted.approvalStatus }
              : row,
          ),
        );
        input.setSelected(submitted);
        await input.reloadUtilities?.();
        toast.success("Monthly utility data submitted for approval");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to submit monthly utility data.");
        return false;
      }
    },
    async deleteSelected() {
      if (!input.selected) return;
      try { await deleteUtilityRecord(input.selected.id, input.userId); input.setUtilityRows((current) => current.filter((row) => row.id !== input.selected?.id)); input.setSelected(null); input.setDeleteOpen(false); await input.reloadUtilities?.(); toast.success("Utility usage deleted"); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete utility usage."); }
    },
  };
}
