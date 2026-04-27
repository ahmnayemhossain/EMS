import * as React from "react";
import { toast } from "@/app/lib/toast";

import type { ReportBoxReport } from "@/types/ems";
import { stripEmsNotePrefix } from "@/pages/ComplaintBoxPage/utils";

export function useComplaintDrawerState({
  complaint,
  currentUserLabel,
  setSubject,
  setCategory,
  assignTo,
  toggleFlag,
  setStatus,
  addMessage,
}: {
  complaint: ReportBoxReport | null;
  currentUserLabel: string;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
  addMessage: (id: string, msg: { kind: "text"; text: string; author?: string }) => void;
}) {
  const [titleDraft, setTitleDraft] = React.useState("");
  const [categoryDraft, setCategoryDraft] = React.useState<string>("");
  const [assigneeDraft, setAssigneeDraft] = React.useState<string>("");
  const [statusDraft, setStatusDraft] = React.useState<ReportBoxReport["status"]>("new");
  const [flaggedDraft, setFlaggedDraft] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [pendingNotes, setPendingNotes] = React.useState<
    Array<{ id: string; at: string; text: string; author: string }>
  >([]);
  const [showValidation, setShowValidation] = React.useState(false);

  const noteInputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!complaint) return;
    setTitleDraft(complaint.subject || "");
    setCategoryDraft(complaint.category || "");
    setAssigneeDraft(complaint.assignedTo || "");
    setStatusDraft(complaint.status);
    setFlaggedDraft(Boolean(complaint.flagged));
    setPendingNotes([]);
    setNoteDraft("");
    setShowValidation(false);
  }, [complaint?.id]);

  function createLocalId(prefix: string) {
    const rand = Math.random().toString(16).slice(2);
    return `${prefix}_${Date.now().toString(16)}_${rand}`;
  }

  function hasEmsNote(r: ReportBoxReport) {
    return r.messages.some(
      (m) =>
        m.kind === "text" &&
        (m.text || "").toLowerCase().startsWith("ems note:") &&
        stripEmsNotePrefix(m.text).trim().length > 0,
    );
  }

  const drawerDirty = Boolean(
    complaint &&
      (titleDraft.trim() !== (complaint.subject || "").trim() ||
        categoryDraft !== (complaint.category || "") ||
        assigneeDraft !== (complaint.assignedTo || "") ||
        statusDraft !== complaint.status ||
        flaggedDraft !== Boolean(complaint.flagged) ||
        pendingNotes.length > 0 ||
        noteDraft.trim().length > 0),
  );

  function validateDrawer() {
    if (!complaint) return "No complaint selected.";
    if (!titleDraft.trim()) return "Title is required.";
    if (!categoryDraft) return "Category is required.";
    if (!assigneeDraft) return "Supervisor assignment is required.";
    const noteWillExist = hasEmsNote(complaint) || pendingNotes.length > 0 || noteDraft.trim().length > 0;
    if (!noteWillExist) return "Note is required.";
    return null;
  }

  async function saveDrawer() {
    if (!complaint) return false;
    setShowValidation(true);
    const err = validateDrawer();
    if (err) {
      toast.error(err);
      if (err.toLowerCase().includes("note")) noteInputRef.current?.focus();
      return false;
    }

    const nextTitle = titleDraft.trim();
    if (nextTitle !== complaint.subject) setSubject(complaint.id, nextTitle);
    if ((categoryDraft || undefined) !== complaint.category) setCategory(complaint.id, categoryDraft || undefined);
    if ((assigneeDraft || undefined) !== complaint.assignedTo) assignTo(complaint.id, assigneeDraft || undefined);
    if (flaggedDraft !== Boolean(complaint.flagged)) toggleFlag(complaint.id);

    const inline = noteDraft.trim();
    const toAdd = [...pendingNotes, ...(inline ? [{ id: createLocalId("pn"), at: new Date().toISOString(), text: inline, author: currentUserLabel }] : [])];
    for (const n of toAdd) {
      addMessage(complaint.id, { kind: "text", text: `EMS note: ${n.text}`, author: n.author });
    }
    setPendingNotes([]);
    setNoteDraft("");

    if (statusDraft !== complaint.status) {
      setStatus(complaint.id, statusDraft, statusDraft === "handled" ? { handledBy: currentUserLabel } : undefined);
    } else if (statusDraft === "handled" && !complaint.handledBy) {
      setStatus(complaint.id, "handled", { handledBy: currentUserLabel });
    }

    toast.success("Saved");
    return true;
  }

  return {
    titleDraft,
    setTitleDraft,
    categoryDraft,
    setCategoryDraft,
    assigneeDraft,
    setAssigneeDraft,
    statusDraft,
    setStatusDraft,
    flaggedDraft,
    setFlaggedDraft,
    noteDraft,
    setNoteDraft,
    pendingNotes,
    setPendingNotes,
    drawerDirty,
    showValidation,
    setShowValidation,
    validateDrawer,
    saveDrawer,
    noteInputRef,
    hasEmsNote,
  };
}

