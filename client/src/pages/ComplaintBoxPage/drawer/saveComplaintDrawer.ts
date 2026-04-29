import { toast } from "@/app/lib/toast";
import type { ReportBoxReport } from "@/types/ems";

import { createLocalId, type PendingNote } from "@/pages/ComplaintBoxPage/drawer/state-helpers";
import type { SaveComplaintDrawerArgs } from "@/pages/ComplaintBoxPage/drawer/types";

export async function saveComplaintDrawer({
  complaint,
  titleDraft,
  categoryDraft,
  assigneeDraft,
  statusDraft,
  flaggedDraft,
  noteDraft,
  pendingNotes,
  currentUserLabel,
  validateDrawer,
  noteInputRef,
  setShowValidation,
  setSubject,
  setCategory,
  assignTo,
  toggleFlag,
  setStatus,
  addMessage,
  clearNotes,
}: SaveComplaintDrawerArgs) {
  if (!complaint) return false;
  setShowValidation(true);
  const error = validateDrawer();
  if (error) return handleDrawerError(error, noteInputRef);
  applyComplaintEdits({ complaint, titleDraft, categoryDraft, assigneeDraft, flaggedDraft, setSubject, setCategory, assignTo, toggleFlag });
  persistDrawerNotes({ complaint, noteDraft, pendingNotes, currentUserLabel, addMessage, clearNotes });
  syncHandledStatus({ complaint, statusDraft, currentUserLabel, setStatus });
  toast.success("Saved");
  return true;
}

function handleDrawerError(error: string, noteInputRef: { current: HTMLTextAreaElement | null }) {
  toast.error(error);
  if (error.toLowerCase().includes("note")) noteInputRef.current?.focus();
  return false;
}

function applyComplaintEdits(args: {
  complaint: ReportBoxReport;
  titleDraft: string;
  categoryDraft: string;
  assigneeDraft: string;
  flaggedDraft: boolean;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
}) {
  const { complaint, titleDraft, categoryDraft, assigneeDraft, flaggedDraft, setSubject, setCategory, assignTo, toggleFlag } = args;
  const nextTitle = titleDraft.trim();
  if (nextTitle !== complaint.subject) setSubject(complaint.id, nextTitle);
  if ((categoryDraft || undefined) !== complaint.category) setCategory(complaint.id, categoryDraft || undefined);
  if ((assigneeDraft || undefined) !== complaint.assignedTo) assignTo(complaint.id, assigneeDraft || undefined);
  if (flaggedDraft !== Boolean(complaint.flagged)) toggleFlag(complaint.id);
}

function persistDrawerNotes(args: {
  complaint: ReportBoxReport;
  noteDraft: string;
  pendingNotes: PendingNote[];
  currentUserLabel: string;
  addMessage: (id: string, message: { kind: "text"; text: string; author?: string }) => void;
  clearNotes: () => void;
}) {
  const { complaint, noteDraft, pendingNotes, currentUserLabel, addMessage, clearNotes } = args;
  const inline = noteDraft.trim();
  const allNotes = [...pendingNotes, ...(inline ? [{ id: createLocalId("pn"), at: new Date().toISOString(), text: inline, author: currentUserLabel }] : [])];
  allNotes.forEach((note) => addMessage(complaint.id, { kind: "text", text: `EMS note: ${note.text}`, author: note.author }));
  clearNotes();
}

function syncHandledStatus(args: {
  complaint: ReportBoxReport;
  statusDraft: ReportBoxReport["status"];
  currentUserLabel: string;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
}) {
  const { complaint, statusDraft, currentUserLabel, setStatus } = args;
  if (statusDraft !== complaint.status) {
    setStatus(complaint.id, statusDraft, statusDraft === "handled" ? { handledBy: currentUserLabel } : undefined);
    return;
  }
  if (statusDraft === "handled" && !complaint.handledBy) {
    setStatus(complaint.id, "handled", { handledBy: currentUserLabel });
  }
}
