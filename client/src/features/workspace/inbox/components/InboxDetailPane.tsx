import { AlertTriangle, Flag, Info, Mails } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { NotificationItem } from "@/core/app/state/slices/notifications";

import { formatDateTime, toneIcon } from "../utils/inbox-display";

export function InboxDetailPane(props: {
  selected: NotificationItem | null;
  nextUnread: NotificationItem | null;
  onToggleFlag: (id: string) => void;
  onToggleRead: (item: NotificationItem) => void;
  onOpenItem: (item: NotificationItem) => void;
}) {
  const selected = props.selected;

  return (
    <div className="min-h-0 bg-background/30">
      {selected ? (
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b px-5 py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {toneIcon(selected.tone)}
                  <CardTitle className="text-lg">{selected.title}</CardTitle>
                  <StatusBadge tone={selected.tone}>{selected.tone}</StatusBadge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selected.facilityId ? getFacilityName(selected.facilityId) : "Group"} | {formatDateTime(selected.createdAt)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant={selected.flagged ? "default" : "outline"} onClick={() => props.onToggleFlag(selected.id)}>
                  <Flag className={selected.flagged ? "mr-2 size-4 fill-current" : "mr-2 size-4"} />
                  {selected.flagged ? "Flagged" : "Flag"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => props.onToggleRead(selected)}>
                  {selected.read ? "Mark unread" : "Mark read"}
                </Button>
                {props.nextUnread ? (
                  <Button size="sm" variant="outline" onClick={() => props.onOpenItem(props.nextUnread!)}>
                    Next unread
                  </Button>
                ) : null}
                {selected.actionTo ? (
                  <Button size="sm" asChild>
                    <a href={selected.actionTo}>{selected.actionLabel ?? "Open"}</a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="text-sm font-medium">System alert</div>
                  <div className="text-xs text-muted-foreground">EMS unified inbox item | Shortcuts: J / K</div>
                </div>
                {!selected.read ? <StatusBadge tone="compliant">new</StatusBadge> : null}
              </div>

              <div className="space-y-4 text-sm leading-7">
                <p>{selected.description}</p>
                {selected.actionLabel ? (
                  <div className="rounded-xl border bg-muted/20 p-4 text-muted-foreground">
                    Suggested action: <span className="font-medium text-foreground">{selected.actionLabel}</span>
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Info className="size-4 text-sky-500" />
                      Context
                    </div>
                    <div className="text-xs text-muted-foreground">Category: {selected.tone} alert</div>
                    <div className="text-xs text-muted-foreground">Scope: {selected.facilityId ? getFacilityName(selected.facilityId) : "Group"}</div>
                  </div>
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="size-4 text-amber-500" />
                      Next action
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selected.actionLabel ? `Recommended: ${selected.actionLabel}` : "No linked action configured yet."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid h-full place-items-center px-6 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-fit rounded-lg border bg-muted/30 p-3">
              <Mails className="size-5 text-muted-foreground" />
            </div>
            <div className="text-base font-medium">Select an inbox item</div>
            <div className="text-sm text-muted-foreground">Open any alert from the left side to read full details here.</div>
          </div>
        </div>
      )}
    </div>
  );
}
