import { Check, Flag, Mail, MailOpen } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { StatusBadge } from "@/core/components/StatusBadge";
import { getFacilityName } from "@/core/data/mock";
import type { NotificationItem } from "@/core/app/state/notifications";

import { formatDateTime } from "./utils";

type NotificationsListProps = {
  items: NotificationItem[];
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  toggleFlag: (id: string) => void;
  openItem: (id: string) => void;
};

export function NotificationsList(props: NotificationsListProps) {
  return <div className="space-y-3">{props.items.map((item) => <div key={item.id} className={["relative cursor-pointer rounded-xl border p-3 pl-4 pr-12 transition-colors hover:bg-muted/20", item.flagged ? "border-[var(--critical-100)] bg-[var(--critical-50)]" : "", !item.flagged && !item.read ? "border-[var(--success-100)] bg-[var(--success-50)]" : ""].join(" ")} onClick={() => props.openItem(item.id)}>{!item.read ? <span className="absolute inset-y-2 left-2 w-1 rounded-full bg-[var(--success-600)]" /> : null}{item.flagged ? <span className="absolute inset-y-2 left-[0.65rem] w-1 rounded-full bg-[var(--critical-600)]" /> : null}<div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><div className="truncate text-sm font-medium">{item.title}</div>{!item.read ? <StatusBadge tone="compliant">unread</StatusBadge> : null}</div><div className="text-muted-foreground mt-1 text-sm">{item.description}</div><div className="text-muted-foreground mt-2 text-xs">{item.facilityId ? getFacilityName(item.facilityId) : "Group"} • {formatDateTime(item.createdAt)}</div></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label={item.flagged ? "Unflag" : "Flag"} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); props.toggleFlag(item.id); props.markRead(item.id); }} className={item.flagged ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : item.read ? "text-[var(--success-700)]" : "text-muted-foreground"}>{item.flagged ? <Flag className="size-4 fill-current" /> : item.read ? <Check className="size-4" /> : <Flag className="size-4" />}</Button><Button variant="ghost" size="icon" aria-label={item.read ? "Mark unread" : "Mark read"} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); item.read ? props.markUnread(item.id) : props.markRead(item.id); }} className="text-muted-foreground">{item.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}</Button><StatusBadge tone={item.tone}>{item.tone}</StatusBadge></div></div></div>)}</div>;
}
