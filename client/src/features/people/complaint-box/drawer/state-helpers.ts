import type { ReportBoxReport } from "@/core/types/models/ems";

import { stripEmsNotePrefix } from "@/features/people/complaint-box/config/utils";

export type PendingNote = { id: string; at: string; text: string; author: string };

export function createLocalId(prefix: string) {
  const random = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${random}`;
}

export function hasSavedEmsNote(report: ReportBoxReport) {
  return report.messages.some(
    (message) =>
      message.kind === "text" &&
      (message.text || "").toLowerCase().startsWith("ems note:") &&
      stripEmsNotePrefix(message.text).trim().length > 0,
  );
}

export function hasDrawerChanges({
  complaint,
  titleDraft,
  categoryDraft,
  assigneeDraft,
  statusDraft,
  flaggedDraft,
  pendingNotes,
  noteDraft,
}: {
  complaint: ReportBoxReport | null;
  titleDraft: string;
  categoryDraft: string;
  assigneeDraft: string;
  statusDraft: ReportBoxReport["status"];
  flaggedDraft: boolean;
  pendingNotes: PendingNote[];
  noteDraft: string;
}) {
  if (!complaint) return false;
  return Boolean(
    titleDraft.trim() !== (complaint.subject || "").trim() ||
      categoryDraft !== (complaint.category || "") ||
      assigneeDraft !== (complaint.assignedTo || "") ||
      statusDraft !== complaint.status ||
      flaggedDraft !== Boolean(complaint.flagged) ||
      pendingNotes.length > 0 ||
      noteDraft.trim().length > 0,
  );
}

export function getDrawerValidationError({
  complaint,
  titleDraft,
  categoryDraft,
  assigneeDraft,
  pendingNotes,
  noteDraft,
}: {
  complaint: ReportBoxReport | null;
  titleDraft: string;
  categoryDraft: string;
  assigneeDraft: string;
  pendingNotes: PendingNote[];
  noteDraft: string;
}) {
  if (!complaint) return "No complaint selected.";
  if (!titleDraft.trim()) return "Title is required.";
  if (!categoryDraft) return "Category is required.";
  if (!assigneeDraft) return "Supervisor assignment is required.";
  if (!hasSavedEmsNote(complaint) && !pendingNotes.length && !noteDraft.trim().length) {
    return "Note is required.";
  }
  return null;
}
