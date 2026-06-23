import { Flag } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import type { NotificationItem } from "@/core/app/state/slices/notifications";
import { getCompanyName } from "@/core/companies/directory";

import { formatDateTime, toneIcon } from "../utils/inbox-display";

export function InboxListPane(props: {
  items: NotificationItem[];
  selectedId: string | null;
  unreadCount: number;
  onOpenItem: (item: NotificationItem) => void;
  onToggleFlag: (id: string) => void;
}) {
  const { companies } = useSelectedCompany();

  return (
    <div className="flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
      <div className="shrink-0 flex items-center justify-between border-b px-4 py-2.5">
        <div className="text-sm font-medium">{props.items.length} message(s)</div>
        <div className="text-xs text-muted-foreground">{props.unreadCount} unread</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-3">
        {props.items.length ? (
          props.items.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => props.onOpenItem(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  props.onOpenItem(item);
                }
              }}
              className={[
                "w-full border-b px-4 py-3 text-left transition hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/30",
                props.selectedId === item.id ? "bg-muted/30" : "",
                item.flagged ? "border-rose-200 bg-rose-50/80 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:hover:bg-rose-950/40" : "",
                !item.flagged && !item.read ? "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/40" : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">{toneIcon(item.tone)}</div>
                <span className={["mt-1 size-2 rounded-full", item.read ? "bg-muted-foreground/30" : "bg-primary"].join(" ")} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(item.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <StatusBadge tone={item.tone}>{item.tone}</StatusBadge>
                    <span className="text-[11px] text-muted-foreground">{item.facilityId ? getCompanyName(item.facilityId, companies) : "Group"}</span>
                    <button
                      type="button"
                      aria-label={item.flagged ? "Unflag" : "Flag"}
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onToggleFlag(item.id);
                      }}
                      className={[
                        "ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] transition",
                        item.flagged ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40" : "text-muted-foreground hover:bg-muted",
                      ].join(" ")}
                    >
                      <Flag className={item.flagged ? "size-3.5 fill-current" : "size-3.5"} />
                      <span>{item.flagged ? "Flagged" : "Flag"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No inbox items found.</div>
        )}
      </div>
    </div>
  );
}
