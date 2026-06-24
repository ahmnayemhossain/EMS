import * as React from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Textarea } from "@/components/ui/primitives/textarea";

export type WorkflowConfirmOverlayProps = {
  tone: "default" | "warning";
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  note: string;
  onNoteChange: (value: string) => void;
  requireNote: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function WorkflowConfirmOverlay(props: WorkflowConfirmOverlayProps) {
  const [busy, setBusy] = React.useState(false);
  const noteInvalid = props.requireNote && !props.note.trim();

  return (
    <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[26px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[0_24px_64px_rgba(15,23,42,0.18)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))]">
        <div
          className={
            props.tone === "warning"
              ? "mx-auto grid size-11 place-items-center rounded-full border border-amber-500/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.16),rgba(245,158,11,0.06))] text-amber-700 shadow-sm dark:text-amber-300"
              : "mx-auto grid size-11 place-items-center rounded-full border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(16,185,129,0.06))] text-emerald-700 shadow-sm dark:text-emerald-300"
          }
        >
          {props.tone === "warning" ? <X className="size-5" /> : <Check className="size-5" />}
        </div>
        <div className="mt-3 text-center text-base font-semibold tracking-[0.01em]">
          {props.title}
        </div>
        <div className="mt-2 text-center text-sm leading-6 text-muted-foreground">
          {props.description}
        </div>
        {props.requireNote ? (
          <div className="mt-4 space-y-2 text-left">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Reject note
            </div>
            <Textarea
              value={props.note}
              onChange={(event) => props.onNoteChange(event.target.value)}
              placeholder="Write the reason for rejecting this step"
              className={noteInvalid ? "min-h-24 border-destructive" : "min-h-24"}
            />
            <div className={noteInvalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {noteInvalid
                ? "Reject note is required."
                : "This note will be stored in the approval history."}
            </div>
          </div>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={busy}
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={props.tone === "warning" ? "destructive" : "default"}
            className="h-10 rounded-xl shadow-sm"
            disabled={busy || noteInvalid}
            onClick={async () => {
              try {
                setBusy(true);
                await props.onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : props.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
