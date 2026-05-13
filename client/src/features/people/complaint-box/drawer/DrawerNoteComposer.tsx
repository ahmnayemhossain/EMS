import * as React from "react";

import { Textarea } from "@/components/ui/primitives/textarea";
import { cn } from "@/components/ui/primitives/utils";
import { toast } from "@/core/app/lib/toast";
import type { ReportBoxReport } from "@/core/types/models/ems";

export function DrawerNoteComposer({
  complaint,
  noteDraft,
  onNoteChange,
  pendingNotesCount,
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
  pendingNotesCount: number;
  hasEmsNote: (report: ReportBoxReport) => boolean;
  currentUserLabel: string;
  showValidation: boolean;
  onShowValidation: (value: boolean) => void;
  noteInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onAddPendingNote: (note: { at: string; text: string; author: string }) => void;
}) {
  const invalid = showValidation && !hasEmsNote(complaint) && pendingNotesCount === 0 && !noteDraft.trim();

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground text-xs">
        Add note <span className="text-destructive">*</span>
      </div>
      <Textarea
        ref={noteInputRef}
        value={noteDraft}
        onChange={(event) => onNoteChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();

          const text = noteDraft.trim();
          if (!text) {
            onShowValidation(true);
            toast.error("Note is required.");
            return;
          }

          onAddPendingNote({ at: new Date().toISOString(), text, author: currentUserLabel });
          onNoteChange("");
        }}
        placeholder="Write a short note..."
        className={cn("min-h-20", invalid && "border-destructive")}
        aria-invalid={invalid ? true : undefined}
      />
      <div className="text-muted-foreground text-xs">Press Enter to add note • Shift+Enter for new line</div>
    </div>
  );
}
