import { StickyNote } from "lucide-react";

import { VoiceMessage } from "@/components/VoiceMessage";
import { cn } from "@/app/components/ui/utils";
import type { ReportBoxReport } from "@/types/ems";

import { MessagePhoto } from "@/pages/ComplaintBoxPage/drawer/MessagePhoto";
import { getAttachmentSrc, stripEmsNotePrefix } from "@/pages/ComplaintBoxPage/utils";

export function ConversationItem({
  message,
  onPreviewImage,
}: {
  message: ReportBoxReport["messages"][number];
  onPreviewImage: (src: string, alt: string) => void;
}) {
  const note = message.kind === "text" && (message.text || "").toLowerCase().startsWith("ems note:");
  const displayText = note ? stripEmsNotePrefix(message.text) : message.text || "";
  return (
    <div className={cn("flex", note ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[92%] rounded-2xl border px-3 py-2 shadow-sm", note ? "border-dotted bg-card/40" : "border-primary/20 bg-primary/10")}>
        <div className="text-muted-foreground/60 flex items-center gap-2 text-[10px] tabular-nums">
          {note ? <StickyNote className="size-3.5" /> : null}
          {note ? <span className="font-semibold tracking-wide">Note</span> : null}
          <span className="ml-auto">{new Date(message.at).toLocaleString()}</span>
        </div>
        {message.author ? <div className="text-muted-foreground/70 mt-0.5 text-[10px]">{message.author}</div> : null}
        {message.kind === "text" && displayText ? <div className="mt-1 text-sm leading-relaxed">{displayText}</div> : null}
        {message.kind === "photo" ? <MessagePhoto attachment={message.attachment} onPreview={onPreviewImage} /> : null}
        {message.kind === "voice" && getAttachmentSrc(message.attachment) ? (
          <div className="mt-2">
            <VoiceMessage src={getAttachmentSrc(message.attachment)} durationSec={message.durationSec} density="compact" variant="whatsapp" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
