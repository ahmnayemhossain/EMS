import type { ReportBoxReport } from "@/core/types/models/ems";

import { DrawerNoteComposer } from "@/features/people/complaint-box/drawer/DrawerNoteComposer";
import type { PendingNote } from "@/features/people/complaint-box/drawer/state-helpers";

export function ComplaintDrawerNoteSection({
  complaint,
  noteDraft,
  onNoteChange,
  pendingNotes,
  hasEmsNote,
  currentUserLabel,
  showValidation,
  onShowValidation,
  noteInputRef,
  onAddPendingNote,
}: {
  complaint: ReportBoxReport;
  noteDraft: string;
  onNoteChange: (value: string) => void;
  pendingNotes: PendingNote[];
  hasEmsNote: (report: ReportBoxReport) => boolean;
  currentUserLabel: string;
  showValidation: boolean;
  onShowValidation: (value: boolean) => void;
  noteInputRef: { current: HTMLTextAreaElement | null };
  onAddPendingNote: (note: { at: string; text: string; author: string }) => void;
}) {
  return (
    <DrawerNoteComposer
      complaint={complaint}
      noteDraft={noteDraft}
      onNoteChange={onNoteChange}
      pendingNotesCount={pendingNotes.length}
      hasEmsNote={hasEmsNote}
      currentUserLabel={currentUserLabel}
      showValidation={showValidation}
      onShowValidation={onShowValidation}
      noteInputRef={noteInputRef}
      onAddPendingNote={onAddPendingNote}
    />
  );
}
