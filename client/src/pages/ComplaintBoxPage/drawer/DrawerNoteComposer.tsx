import * as React from "react";
import { toast } from "sonner";

import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";
import type { ReportBoxReport } from "@/types/ems";

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
  onNoteChange: (v: string) => void;
  pendingNotesCount: number;
  hasEmsNote: (r: ReportBoxReport) => boolean;
  currentUserLabel: string;
  showValidation: boolean;
  onShowValidation: (v: boolean) => void;
  noteInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onAddPendingNote: (n: { at: string; text: string; author: string }) => void;
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
        onChange={(e) => onNoteChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || e.shiftKey) return;
          e.preventDefault();
          const t = noteDraft.trim();
          if (!t) {
            onShowValidation(true);
            toast.error("Note is required.");
            return;
          }
          onAddPendingNote({ at: new Date().toISOString(), text: t, author: currentUserLabel });
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
