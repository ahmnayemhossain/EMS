import type * as React from "react";
import { fileToBase64 } from "@/core/app/lib/api";
import { toast } from "@/core/app/lib/toast";

import {
  createUtilityRecord,
  deleteUtilityRecord,
  transitionUtilityMonth,
  updateUtilityRecord,
  uploadUtilityAttachment,
  type UtilityRecordInput,
} from "@/features/operations/utilities/services/api";
import type { UtilityUsagePayload } from "@/features/operations/utilities/config/baseline-settings";
import type { UtilityRecord } from "@/core/types/models/ems";

function toVarianceFlag(status: UtilityUsagePayload["status"]) {
  return status === "alert" || status === "high" ? "high" : status === "watch" ? "watch" : "normal";
}

function toRecordInput(payload: UtilityUsagePayload): UtilityRecordInput {
  return {
    facilityId: payload.companyId,
    type: payload.utilityType,
    meterId: payload.meterId ? Number(payload.meterId) : undefined,
    meterName: payload.meterName,
    sourceId: payload.sourceId,
    periodStart: payload.periodStart,
    periodEnd: payload.periodEnd,
    previousReading: payload.previousReading,
    currentReading: payload.currentReading,
    dieselLiters: payload.dieselLiters,
    uom: payload.unit,
    value: payload.consumption,
    baselineValue: payload.baselineValue,
    minThreshold: payload.minThreshold,
    maxThreshold: payload.maxThreshold,
    variance: payload.variance,
    variancePercent: payload.variancePercent,
    varianceFlag: toVarianceFlag(payload.status),
    status: payload.status,
    remarks: payload.remarks,
  };
}

function getCoverageWarning(record: UtilityRecord) {
  const missingDaysCount = Number(record.missingDaysCount || 0);
  if (missingDaysCount <= 0) return "";
  const missingLabel = (record.missingRanges || [])
    .map((item) => (item.start === item.end ? item.start : `${item.start} to ${item.end}`))
    .join(", ");
  return `Coverage warning: ${missingDaysCount} day${missingDaysCount === 1 ? "" : "s"} missing (${missingLabel || "check month coverage"}).`;
}

function formatStatusLabel(stepKey: string) {
  const key = String(stepKey || "").trim().toLowerCase();
  if (key === "draft") return "Draft";
  if (key === "submit" || key === "submitted") return "Submitted";
  if (key === "check" || key === "checked") return "Checked";
  if (key === "recommend" || key === "recommended") return "Recommended";
  if (key === "approve" || key === "approved") return "Approved";
  if (key === "audit" || key === "audited") return "Audited";
  return key ? key.slice(0, 1).toUpperCase() + key.slice(1) : "Updated";
}

async function attachPdf(record: UtilityRecord, attachment: File, userId: string) {
  return uploadUtilityAttachment(record.id, { fileName: attachment.name, mimeType: attachment.type, dataBase64: await fileToBase64(attachment) }, userId);
}

function mapMonthGroupRows(updated: UtilityRecord, row: UtilityRecord) {
  const sameMonthGroup =
    row.periodMonth === updated.periodMonth &&
    row.meterKey === updated.meterKey &&
    row.type === updated.type &&
    row.facilityId === updated.facilityId;

  if (!sameMonthGroup) return row;

  return {
    ...row,
    approvalStatus: updated.approvalStatus,
    approvedBy: updated.approvedBy,
    approvedAt: updated.approvedAt,
    monthComplete: updated.monthComplete,
    missingRanges: updated.missingRanges,
    missingDaysCount: updated.missingDaysCount,
    coverageStart: updated.coverageStart,
    coverageEnd: updated.coverageEnd,
    coverageDays: updated.coverageDays,
    monthDays: updated.monthDays,
    monthRecordCount: updated.monthRecordCount,
    monthTotalValue: updated.monthTotalValue,
    monthTotalDieselLiters: updated.monthTotalDieselLiters,
  };
}

export function createUtilityActions(input: { userId: string; selected: UtilityRecord | null; setSelected: (record: UtilityRecord | null) => void; setDeleteOpen: (open: boolean) => void; setUtilityRows: React.Dispatch<React.SetStateAction<UtilityRecord[]>>; reloadUtilities?: () => Promise<void>; }) {
  return {
    async createUsage(payload: UtilityUsagePayload) {
      try {
        let created = await createUtilityRecord(toRecordInput(payload), input.userId);
        if (payload.attachment) {
          try {
            created = await attachPdf(created, payload.attachment, input.userId);
          } catch (error) {
            input.setUtilityRows((current) => [created, ...current]);
            toast.error(error instanceof Error ? `Usage saved, but PDF upload failed: ${error.message}` : "Usage saved, but PDF upload failed.");
            return true;
          }
        }
        input.setUtilityRows((current) => [created, ...current]);
        await input.reloadUtilities?.();
        const coverageWarning = getCoverageWarning(created);
        if (coverageWarning) toast.successDetail("Utility usage saved", coverageWarning);
        else toast.success("Utility usage saved");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save utility usage.");
        return false;
      }
    },

    async updateUsage(payload: UtilityUsagePayload) {
      if (!input.selected) return false;
      try {
        let updated = await updateUtilityRecord(input.selected.id, toRecordInput(payload), input.userId);
        if (payload.attachment) {
          try {
            updated = await attachPdf(updated, payload.attachment, input.userId);
          } catch (error) {
            input.setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
            input.setSelected(updated);
            toast.error(error instanceof Error ? `Usage updated, but PDF upload failed: ${error.message}` : "Usage updated, but PDF upload failed.");
            return true;
          }
        }
        input.setUtilityRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
        input.setSelected(updated);
        await input.reloadUtilities?.();
        const coverageWarning = getCoverageWarning(updated);
        if (coverageWarning) toast.successDetail("Utility usage updated", coverageWarning);
        else toast.success("Utility usage updated");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update utility usage.");
        return false;
      }
    },

    async transitionSelectedMonth(transitionKey: string) {
      if (!input.selected) return false;
      try {
        const updated = await transitionUtilityMonth(input.selected.id, transitionKey, input.userId);
        input.setUtilityRows((current) => current.map((row) => mapMonthGroupRows(updated, row)));
        input.setSelected(updated);
        await input.reloadUtilities?.();
        toast.successDetail(
          "Utility status updated",
          `Month moved to ${formatStatusLabel(updated.approvalStatus)}.`,
        );
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update monthly utility workflow.");
        return false;
      }
    },

    async deleteSelected() {
      if (!input.selected) return;
      try {
        await deleteUtilityRecord(input.selected.id, input.userId);
        input.setUtilityRows((current) => current.filter((row) => row.id !== input.selected?.id));
        input.setSelected(null);
        input.setDeleteOpen(false);
        await input.reloadUtilities?.();
        toast.success("Utility usage deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete utility usage.");
      }
    },
  };
}
