import * as React from "react";
import { toast } from "@/core/app/lib/toast";

import { ComplaintConversationSection } from "@/features/ComplaintBoxPage/drawer/ComplaintConversationSection";
import { DrawerHeaderBar } from "@/features/ComplaintBoxPage/drawer/DrawerHeaderBar";
import { DrawerMetaFields } from "@/features/ComplaintBoxPage/drawer/DrawerMetaFields";
import { ComplaintDrawerNoteSection } from "@/features/ComplaintBoxPage/drawer/ComplaintDrawerNoteSection";
import type { ComplaintDrawerBodyProps } from "@/features/ComplaintBoxPage/drawer/types";
import { useComplaintDrawerState } from "@/features/ComplaintBoxPage/drawer/useComplaintDrawerState";

export function ComplaintDrawerBody({
  complaint,
  currentUserLabel,
  reportAssignees,
  addRecord,
  onSwitchToRecords,
  onRequestDeleteComplaint,
  onPreviewImage,
  setSubject,
  setCategory,
  assignTo,
  toggleFlag,
  setStatus,
  addMessage,
}: ComplaintDrawerBodyProps) {
  const s = useComplaintDrawerState({
    complaint,
    currentUserLabel,
    setSubject,
    setCategory,
    assignTo,
    toggleFlag,
    setStatus,
    addMessage,
  });

  return (
    <div className="space-y-4">
      <DrawerHeaderBar
        complaint={complaint}
        currentUserLabel={currentUserLabel}
        statusDraft={s.statusDraft}
        flaggedDraft={s.flaggedDraft}
        categoryDraft={s.categoryDraft}
        drawerDirty={s.drawerDirty}
        onRecord={() => void handleRecordAction()}
        onSave={() => void s.saveDrawer()}
      />

      <DrawerMetaFields
        titleDraft={s.titleDraft}
        onTitleChange={s.setTitleDraft}
        categoryDraft={s.categoryDraft}
        onCategoryChange={s.setCategoryDraft}
        assigneeDraft={s.assigneeDraft}
        onAssigneeChange={s.setAssigneeDraft}
        statusDraft={s.statusDraft}
        onStatusChange={s.setStatusDraft}
        flaggedDraft={s.flaggedDraft}
        onFlaggedToggle={() => s.setFlaggedDraft((v) => !v)}
        reportAssignees={reportAssignees}
        showValidation={s.showValidation}
        onDelete={() => onRequestDeleteComplaint(complaint)}
      />

      <ComplaintConversationSection complaint={complaint} pendingNotes={s.pendingNotes} onPreviewImage={onPreviewImage} />

      <ComplaintDrawerNoteSection
        complaint={complaint}
        noteDraft={s.noteDraft}
        onNoteChange={s.setNoteDraft}
        pendingNotes={s.pendingNotes}
        hasEmsNote={s.hasEmsNote}
        currentUserLabel={currentUserLabel}
        showValidation={s.showValidation}
        onShowValidation={s.setShowValidation}
        noteInputRef={s.noteInputRef}
        onAddPendingNote={addPendingNote}
      />
    </div>
  );

  async function handleRecordAction() {
    s.setShowValidation(true);
    const err = s.validateDrawer();
    if (err) return showDrawerError(err);
    const id = addRecord(complaint.id);
    if (id) onSwitchToRecords();
  }

  function addPendingNote(note: { at: string; text: string; author: string }) {
    s.setPendingNotes((prev) => [...prev, { id: `pn_${Date.now().toString(16)}`, ...note }]);
  }

  function showDrawerError(error: string) {
    toast.error(error);
    if (error.toLowerCase().includes("note")) s.noteInputRef.current?.focus();
  }
}
