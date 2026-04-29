import type { ReportBoxReport } from "@/types/ems";

import { ConversationItem } from "@/pages/ComplaintBoxPage/drawer/ConversationItem";
import { PendingNoteItem } from "@/pages/ComplaintBoxPage/drawer/PendingNoteItem";
import type { PendingNote } from "@/pages/ComplaintBoxPage/drawer/state-helpers";

export function ConversationThread({
  complaint,
  pendingNotes,
  onPreviewImage,
}: {
  complaint: ReportBoxReport;
  pendingNotes: PendingNote[];
  onPreviewImage: (src: string, alt: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-muted/10 p-3">
      <div className="space-y-2">
        {complaint.messages.map((message) => (
          <ConversationItem key={message.id} message={message} onPreviewImage={onPreviewImage} />
        ))}
        {pendingNotes.map((note) => (
          <PendingNoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
