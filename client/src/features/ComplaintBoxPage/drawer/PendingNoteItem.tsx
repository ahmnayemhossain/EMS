import { StickyNote } from "lucide-react";

import type { PendingNote } from "@/features/ComplaintBoxPage/drawer/state-helpers";

export function PendingNoteItem({ note }: { note: PendingNote }) {
  return (
    <div className="flex justify-start opacity-90">
      <div className="max-w-[92%] rounded-2xl border border-dotted bg-card/40 px-3 py-2 shadow-sm">
        <div className="text-muted-foreground/60 flex items-center gap-2 text-[10px] tabular-nums">
          <StickyNote className="size-3.5" />
          <span className="font-semibold tracking-wide">Note</span>
          <span className="ml-2">pending</span>
          <span className="ml-auto">{new Date(note.at).toLocaleString()}</span>
        </div>
        <div className="text-muted-foreground/70 mt-0.5 text-[10px]">{note.author}</div>
        <div className="mt-1 text-sm leading-relaxed">{note.text}</div>
      </div>
    </div>
  );
}
