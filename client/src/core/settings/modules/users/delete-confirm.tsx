import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";

export function DeleteConfirm(props: { label: string; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border bg-background p-5 text-center shadow-2xl">
        <div className="mx-auto grid size-11 place-items-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive"><Trash2 className="size-5" /></div>
        <div className="mt-3 text-base font-semibold">Delete {props.label || "user"}?</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">This will remove the user from the database.</div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={props.onCancel}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={busy} onClick={async () => { try { setBusy(true); await props.onConfirm(); } finally { setBusy(false); } }}>{busy ? "Deleting..." : "Delete"}</Button>
        </div>
      </div>
    </div>
  );
}
