import type { ReportBoxReport } from "@/core/types/ems";

import { ConversationThread } from "@/features/ComplaintBoxPage/drawer/ConversationThread";
import type { PendingNote } from "@/features/ComplaintBoxPage/drawer/state-helpers";

export function ComplaintConversationSection({
  complaint,
  pendingNotes,
  onPreviewImage,
}: {
  complaint: ReportBoxReport;
  pendingNotes: PendingNote[];
  onPreviewImage: (src: string, alt: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-muted-foreground text-xs">Conversation</div>
      <ConversationThread complaint={complaint} pendingNotes={pendingNotes} onPreviewImage={onPreviewImage} />
    </div>
  );
}
