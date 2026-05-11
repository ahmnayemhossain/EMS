import * as React from "react";
import type { ReportBoxReport } from "@/core/types/models/ems";

import { getDrawerValidationError, hasDrawerChanges, hasSavedEmsNote, type PendingNote } from "@/features/people/complaint-box/drawer/state-helpers";
import { saveComplaintDrawer } from "@/features/people/complaint-box/drawer/saveComplaintDrawer";
import type { UseComplaintDrawerStateArgs } from "@/features/people/complaint-box/drawer/types";

export function useComplaintDrawerState({
  complaint,
  currentUserLabel,
  setSubject,
  setCategory,
  assignTo,
  toggleFlag,
  setStatus,
  addMessage,
}: UseComplaintDrawerStateArgs) {
  const [titleDraft, setTitleDraft] = React.useState("");
  const [categoryDraft, setCategoryDraft] = React.useState<string>("");
  const [assigneeDraft, setAssigneeDraft] = React.useState<string>("");
  const [statusDraft, setStatusDraft] = React.useState<ReportBoxReport["status"]>("new");
  const [flaggedDraft, setFlaggedDraft] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [pendingNotes, setPendingNotes] = React.useState<PendingNote[]>([]);
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

  const drawerDirty = hasDrawerChanges({ complaint, titleDraft, categoryDraft, assigneeDraft, statusDraft, flaggedDraft, pendingNotes, noteDraft });
  const validateDrawer = () => getDrawerValidationError({ complaint, titleDraft, categoryDraft, assigneeDraft, pendingNotes, noteDraft });

  async function saveDrawer() {
    return saveComplaintDrawer({
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
      clearNotes: () => { setPendingNotes([]); setNoteDraft(""); },
    });
  }

  return {
    titleDraft, setTitleDraft, categoryDraft, setCategoryDraft, assigneeDraft, setAssigneeDraft,
    statusDraft, setStatusDraft, flaggedDraft, setFlaggedDraft, noteDraft, setNoteDraft,
    pendingNotes, setPendingNotes, drawerDirty, showValidation, setShowValidation, validateDrawer, saveDrawer, noteInputRef,
    hasEmsNote: hasSavedEmsNote,
  };
}
