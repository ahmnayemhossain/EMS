import { Pencil, Trash2 } from "lucide-react";

import { VoiceMessage } from "@/components/layout/primitives/VoiceMessage";
import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/components/ui/primitives/utils";
import { StatusIcon } from "@/features/public/report-box/StatusIcon";
import { BN } from "@/features/public/report-box/text";
import type { LocalMessage } from "@/features/public/report-box/types";

export function MessageList({ messages, sessionReportId, sending, editTarget, setEditTarget, setComposer, setImagePreview, onDeleteMessage, bottomRef }: any) {
  if (!messages.length) {
    return <div className="text-muted-foreground rounded-xl border bg-card p-4 text-sm">{BN.startPrompt}</div>;
  }

  return (
    <div className="space-y-2">
      {messages.map((message: LocalMessage) => (
        <MessageBubble
          key={message.id}
          {...{ message, sessionReportId, sending, editTarget, setEditTarget, setComposer, setImagePreview, onDeleteMessage }}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message, sessionReportId, sending, editTarget, setEditTarget, setComposer, setImagePreview, onDeleteMessage }: any) {
  const canServerMutate = Boolean(sessionReportId && message.serverMessageId && !sending);

  return (
    <div className={cn("flex", message.from === "ems" ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl border px-3 py-2 shadow-sm",
          message.from === "ems"
            ? message.emphasis === "success"
              ? "border-[var(--success-100)] bg-[var(--success-50)]"
              : "border-border bg-muted/30"
            : "border-primary/20 bg-primary/10",
        )}
      >
        {canServerMutate ? (
          <div className="mb-1 flex items-center justify-end gap-1">
            {message.kind === "text" ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-muted/30"
                aria-label={BN.edit}
                onClick={() => {
                  if (!message.serverMessageId) return;
                  setEditTarget({ localId: message.id, serverMessageId: message.serverMessageId });
                  setComposer(message.text || "");
                  window.setTimeout(() => null, 0);
                }}
              >
                <Pencil className="size-3.5" />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:bg-muted/30"
              aria-label={BN.delete}
              onClick={() => onDeleteMessage(message)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {message.kind === "text" ? (
          <div className={cn(message.emphasis === "success" ? "text-base font-semibold leading-relaxed" : "text-sm leading-relaxed")}>
            <span>{message.text}</span>
          </div>
        ) : null}

        {message.kind === "voice" && message.attachment?.dataUrl ? (
          <VoiceMessage
            src={message.attachment.dataUrl}
            durationSec={message.durationSec}
            density="compact"
            variant="whatsapp"
            labels={{ play: BN.play, pause: BN.pause }}
            className="min-w-[220px]"
          />
        ) : null}

        {message.kind === "photo" && message.attachment?.dataUrl ? (
          <button
            type="button"
            className="mt-1 block w-full cursor-zoom-in"
            onClick={() =>
              setImagePreview({
                src: message.attachment!.dataUrl!,
                alt: message.attachment?.name || "সংযুক্ত ছবি",
              })
            }
            aria-label="Preview image"
          >
            <img
              src={message.attachment.dataUrl}
              alt={message.attachment.name || "সংযুক্ত ছবি"}
              className="max-h-64 w-full rounded-xl bg-muted/30 object-contain"
            />
          </button>
        ) : null}

        {message.from === "worker" ? (
          <div className="mt-2 flex items-center justify-end">
            <StatusIcon message={message} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
