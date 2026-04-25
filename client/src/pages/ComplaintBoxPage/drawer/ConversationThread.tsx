import { StickyNote } from "lucide-react";

import { VoiceMessage } from "@/components/VoiceMessage";
import { cn } from "@/app/components/ui/utils";
import type { ReportBoxAttachment, ReportBoxReport } from "@/types/ems";
import { getAttachmentSrc, stripEmsNotePrefix } from "@/pages/ComplaintBoxPage/utils";

function isEmsNote(m: ReportBoxReport["messages"][number]) {
  return m.kind === "text" && (m.text || "").toLowerCase().startsWith("ems note:");
}

function MessagePhoto({
  attachment,
  onPreview,
}: {
  attachment?: ReportBoxAttachment;
  onPreview: (src: string, alt: string) => void;
}) {
  const src = getAttachmentSrc(attachment);
  if (!src) return null;
  return (
    <button
      type="button"
      className="mt-2 block w-full cursor-zoom-in"
      onClick={() => onPreview(src, attachment?.name || "photo")}
      aria-label="Preview image"
    >
      <img
        src={src}
        alt={attachment?.name || "photo"}
        className="max-h-64 w-full rounded-xl bg-muted/30 object-contain"
      />
    </button>
  );
}

export function ConversationThread({
  complaint,
  pendingNotes,
  onPreviewImage,
}: {
  complaint: ReportBoxReport;
  pendingNotes: Array<{ id: string; at: string; text: string; author: string }>;
  onPreviewImage: (src: string, alt: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-muted/10 p-3">
      <div className="space-y-2">
        {complaint.messages.map((m) => {
          const note = isEmsNote(m);
          const displayText = note ? stripEmsNotePrefix(m.text) : m.text || "";

          return (
            <div key={m.id} className={cn("flex", note ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl border px-3 py-2 shadow-sm",
                  note ? "border-dotted bg-card/40" : "border-primary/20 bg-primary/10",
                )}
              >
                <div className="text-muted-foreground/60 flex items-center gap-2 text-[10px] tabular-nums">
                  {note ? <StickyNote className="size-3.5" /> : null}
                  {note ? <span className="font-semibold tracking-wide">Note</span> : null}
                  <span className="ml-auto">{new Date(m.at).toLocaleString()}</span>
                </div>
                {m.author ? (
                  <div className="text-muted-foreground/70 mt-0.5 text-[10px]">{m.author}</div>
                ) : null}

                {m.kind === "text" && displayText ? (
                  <div className="mt-1 text-sm leading-relaxed">{displayText}</div>
                ) : null}

                {m.kind === "photo" ? (
                  <MessagePhoto attachment={m.attachment} onPreview={onPreviewImage} />
                ) : null}

                {m.kind === "voice" && getAttachmentSrc(m.attachment) ? (
                  <div className="mt-2">
                    <VoiceMessage
                      src={getAttachmentSrc(m.attachment)}
                      durationSec={m.durationSec}
                      density="compact"
                      variant="whatsapp"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {pendingNotes.map((n) => (
          <div key={n.id} className="flex justify-start opacity-90">
            <div className="max-w-[92%] rounded-2xl border border-dotted bg-card/40 px-3 py-2 shadow-sm">
              <div className="text-muted-foreground/60 flex items-center gap-2 text-[10px] tabular-nums">
                <StickyNote className="size-3.5" />
                <span className="font-semibold tracking-wide">Note</span>
                <span className="ml-2">pending</span>
                <span className="ml-auto">{new Date(n.at).toLocaleString()}</span>
              </div>
              <div className="text-muted-foreground/70 mt-0.5 text-[10px]">{n.author}</div>
              <div className="mt-1 text-sm leading-relaxed">{n.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

