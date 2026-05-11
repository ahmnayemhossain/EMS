import { Check, Flag, Mail, MailOpen, X } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/primitives/drawer";
import { Separator } from "@/components/ui/primitives/separator";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { NotificationItem } from "@/core/app/state/slices/notifications";

import { formatDateTime } from "./utils";

type NotificationDrawerProps = {
  open: boolean; selected?: NotificationItem; setOpen: (open: boolean) => void;
  markRead: (id: string) => void; markUnread: (id: string) => void; toggleFlag: (id: string) => void;
};

export function NotificationDrawer(props: NotificationDrawerProps) {
  const navigate = useNavigate();
  return <Drawer open={props.open} onOpenChange={props.setOpen} direction="right"><DrawerContent className="sm:max-w-lg"><DrawerHeader className="pb-3"><div className="flex items-start justify-between gap-3"><DrawerTitle className="min-w-0 truncate">Notification</DrawerTitle><Button variant="ghost" size="icon" aria-label="Close" onClick={() => props.setOpen(false)}><X className="size-4" /></Button></div></DrawerHeader><Separator /><div className="flex-1 overflow-y-auto p-4">{props.selected ? <div className="space-y-4"><div className="rounded-xl border p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-sm font-semibold">{props.selected.title}</div><div className="text-muted-foreground mt-1 text-xs">{props.selected.facilityId ? getFacilityName(props.selected.facilityId) : "Group"} â€¢ {formatDateTime(props.selected.createdAt)}</div></div><StatusBadge tone={props.selected.tone}>{props.selected.tone}</StatusBadge></div></div><div className="rounded-xl border p-3"><div className="text-muted-foreground text-xs">Details</div><div className="mt-1 text-sm">{props.selected.description}</div></div><div className="flex flex-wrap gap-2"><Button variant={props.selected.flagged ? "destructive" : "outline"} onClick={() => { props.toggleFlag(props.selected!.id); props.markRead(props.selected!.id); }}>{props.selected.flagged ? <Flag className="mr-2 size-4 fill-current" /> : props.selected.read ? <Check className="mr-2 size-4" /> : <Flag className="mr-2 size-4" />}{props.selected.flagged ? "Flagged" : "Flag"}</Button><Button variant="outline" onClick={() => (props.selected!.read ? props.markUnread(props.selected!.id) : props.markRead(props.selected!.id))}>{props.selected.read ? <><Mail className="mr-2 size-4" />Mark unread</> : <><MailOpen className="mr-2 size-4" />Mark read</>}</Button>{props.selected.actionTo ? <Button onClick={() => { navigate(props.selected!.actionTo!); props.setOpen(false); }}>{props.selected.actionLabel ?? "Open action"}</Button> : null}</div></div> : <div className="text-muted-foreground text-sm">Select a notification.</div>}</div></DrawerContent></Drawer>;
}

