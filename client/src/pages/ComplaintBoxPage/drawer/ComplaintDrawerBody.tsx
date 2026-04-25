import * as React from "react";
import { toast } from "sonner";

import type { ReportBoxReport } from "@/types/ems";

import { ConversationThread } from "@/pages/ComplaintBoxPage/drawer/ConversationThread";
import { DrawerHeaderBar } from "@/pages/ComplaintBoxPage/drawer/DrawerHeaderBar";
import { DrawerMetaFields } from "@/pages/ComplaintBoxPage/drawer/DrawerMetaFields";
import { DrawerNoteComposer } from "@/pages/ComplaintBoxPage/drawer/DrawerNoteComposer";
import { useComplaintDrawerState } from "@/pages/ComplaintBoxPage/drawer/useComplaintDrawerState";

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
}: {
  complaint: ReportBoxReport;
  currentUserLabel: string;
  reportAssignees: string[];
  addRecord: (reportId: string) => string | undefined;
  onSwitchToRecords: () => void;
  onRequestDeleteComplaint: (report: ReportBoxReport) => void;
  onPreviewImage: (src: string, alt: string) => void;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
  addMessage: (id: string, msg: { kind: "text"; text: string; author?: string }) => void;
}) {
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
        onRecord={() => {
          s.setShowValidation(true);
          const err = s.validateDrawer();
          if (err) {
            toast.error(err);
            if (err.toLowerCase().includes("note")) s.noteInputRef.current?.focus();
            return;
          }
          const id = addRecord(complaint.id);
          if (id) onSwitchToRecords();
        }}
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

      <div className="space-y-2">
        <div className="text-muted-foreground text-xs">Conversation</div>
        <ConversationThread complaint={complaint} pendingNotes={s.pendingNotes} onPreviewImage={onPreviewImage} />
      </div>

      <DrawerNoteComposer
        complaint={complaint}
        noteDraft={s.noteDraft}
        onNoteChange={s.setNoteDraft}
        pendingNotesCount={s.pendingNotes.length}
        hasEmsNote={s.hasEmsNote}
        currentUserLabel={currentUserLabel}
        showValidation={s.showValidation}
        onShowValidation={s.setShowValidation}
        noteInputRef={s.noteInputRef}
        onAddPendingNote={(n) =>
          s.setPendingNotes((prev) => [
            ...prev,
            { id: `pn_${Date.now().toString(16)}`, at: n.at, text: n.text, author: n.author },
          ])
        }
      />
    </div>
  );
}

