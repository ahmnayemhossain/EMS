import * as React from "react";
import { Bell, Check, Flag, Mail, MailOpen, X } from "lucide-react";
import { useNavigate } from "react-router";

import { getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer";
import { Separator } from "@/app/components/ui/separator";
import { useNotifications } from "@/app/state/notifications";

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { items, markAllRead, markRead, markUnread, toggleFlag } = useNotifications();
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showFlaggedOnly, setShowFlaggedOnly] = React.useState(false);

  const selected = React.useMemo(
    () => (selectedId ? items.find((n) => n.id === selectedId) : undefined),
    [items, selectedId],
  );

  const flaggedCount = React.useMemo(
    () => items.filter((n) => n.flagged).length,
    [items],
  );

  const visibleItems = React.useMemo(() => {
    if (!showFlaggedOnly) return items;
    return items.filter((n) => n.flagged);
  }, [items, showFlaggedOnly]);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showFlaggedOnly ? "destructive" : "outline"}
              onClick={() => setShowFlaggedOnly((v) => !v)}
            >
              <Flag className={showFlaggedOnly ? "mr-2 size-4 fill-current" : "mr-2 size-4"} />
              Flagged ({flaggedCount})
            </Button>
            <Button variant="outline" onClick={markAllRead}>
              <Bell className="mr-2 size-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {visibleItems.map((n) => (
              <div
                key={n.id}
                className={[
                  "relative cursor-pointer rounded-xl border p-3 pl-4 pr-12 transition-colors hover:bg-muted/20",
                  n.flagged ? "border-[var(--critical-100)] bg-[var(--critical-50)]" : "",
                  !n.flagged && !n.read
                    ? "border-[var(--success-100)] bg-[var(--success-50)]"
                    : "",
                ].join(" ")}
                onClick={() => {
                  setSelectedId(n.id);
                  setViewOpen(true);
                  markRead(n.id);
                }}
              >
                {!n.read ? (
                  <span className="absolute inset-y-2 left-2 w-1 rounded-full bg-[var(--success-600)]" />
                ) : null}
                {n.flagged ? (
                  <span className="absolute inset-y-2 left-[0.65rem] w-1 rounded-full bg-[var(--critical-600)]" />
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{n.title}</div>
                      {!n.read ? <StatusBadge tone="compliant">unread</StatusBadge> : null}
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">{n.description}</div>
                    <div className="text-muted-foreground mt-2 text-xs">
                      {n.facilityId ? getFacilityName(n.facilityId) : "Group"} •{" "}
                      {formatDateTime(n.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={n.flagged ? "Unflag" : "Flag"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlag(n.id);
                        // Flag/unflag implies reviewed (checked)
                        markRead(n.id);
                      }}
                      className={
                        n.flagged
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : n.read
                            ? "text-[var(--success-700)]"
                            : "text-muted-foreground"
                      }
                    >
                      {n.flagged ? (
                        <Flag className="size-4 fill-current" />
                      ) : n.read ? (
                        <Check className="size-4" />
                      ) : (
                        <Flag className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={n.read ? "Mark unread" : "Mark read"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (n.read) markUnread(n.id);
                        else markRead(n.id);
                      }}
                      className="text-muted-foreground"
                    >
                      {n.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                    </Button>
                    <StatusBadge tone={n.tone}>{n.tone}</StatusBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Drawer open={viewOpen} onOpenChange={setViewOpen} direction="right">
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <DrawerTitle className="min-w-0 truncate">Notification</DrawerTitle>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setViewOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </DrawerHeader>
          <Separator />

          <div className="flex-1 overflow-y-auto p-4">
            {selected ? (
              <div className="space-y-4">
                <div className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{selected.title}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {selected.facilityId ? getFacilityName(selected.facilityId) : "Group"} •{" "}
                        {formatDateTime(selected.createdAt)}
                      </div>
                    </div>
                    <StatusBadge tone={selected.tone}>{selected.tone}</StatusBadge>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="text-muted-foreground text-xs">Details</div>
                  <div className="mt-1 text-sm">{selected.description}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selected.flagged ? "destructive" : "outline"}
                    onClick={() => {
                      toggleFlag(selected.id);
                      markRead(selected.id);
                    }}
                  >
                    {selected.flagged ? (
                      <Flag className="mr-2 size-4 fill-current" />
                    ) : selected.read ? (
                      <Check className="mr-2 size-4" />
                    ) : (
                      <Flag className="mr-2 size-4" />
                    )}
                    {selected.flagged ? "Flagged" : "Flag"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (selected.read ? markUnread(selected.id) : markRead(selected.id))}
                  >
                    {selected.read ? (
                      <>
                        <Mail className="mr-2 size-4" />
                        Mark unread
                      </>
                    ) : (
                      <>
                        <MailOpen className="mr-2 size-4" />
                        Mark read
                      </>
                    )}
                  </Button>
                  {selected.actionTo ? (
                    <Button
                      onClick={() => {
                        navigate(selected.actionTo!);
                        setViewOpen(false);
                      }}
                    >
                      {selected.actionLabel ?? "Open action"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Select a notification.</div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
