import * as React from "react";
import { AlertTriangle, CheckCheck, Flag, Info, Mails, Search, Siren, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { useNotifications, type NotificationItem } from "@/core/app/state/slices/notifications";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import { formatDateTime } from "@/features/workspace/notifications-legacy/utils";

export function InboxPage() {
  const notifications = useNotifications();
  const [query, setQuery] = React.useState("");
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const [showStarredOnly, setShowStarredOnly] = React.useState(false);
  const [toneFilter, setToneFilter] = React.useState<"all" | NotificationItem["tone"]>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(notifications.items[0]?.id ?? null);

  React.useEffect(() => {
    const scrollHost = document.querySelector<HTMLElement>('[data-slot="app-canvas-scroll"]');
    const previous = scrollHost?.style.overflow;
    if (scrollHost) scrollHost.style.overflow = "hidden";
    return () => {
      if (scrollHost) scrollHost.style.overflow = previous || "";
    };
  }, []);

  React.useEffect(() => {
    if (!notifications.items.some((item) => item.id === selectedId)) {
      setSelectedId(notifications.items[0]?.id ?? null);
    }
  }, [notifications.items, selectedId]);

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notifications.items
      .filter((item) => {
        if (showUnreadOnly && item.read) return false;
        if (showStarredOnly && !item.flagged) return false;
        if (toneFilter !== "all" && item.tone !== toneFilter) return false;
        if (!normalizedQuery) return true;
        return [
          item.title,
          item.description,
          item.facilityId ? getFacilityName(item.facilityId) : "group",
          item.tone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice()
      .sort((a, b) => {
        const unreadDiff = Number(a.read) - Number(b.read);
        if (unreadDiff !== 0) return unreadDiff;
        const flaggedDiff = Number(b.flagged) - Number(a.flagged);
        if (flaggedDiff !== 0) return flaggedDiff;
        const toneDiff = toneWeight(b.tone) - toneWeight(a.tone);
        if (toneDiff !== 0) return toneDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [notifications.items, query, showStarredOnly, showUnreadOnly, toneFilter]);

  const selected =
    filteredItems.find((item) => item.id === selectedId) ??
    notifications.items.find((item) => item.id === selectedId) ??
    filteredItems[0] ??
    null;

  React.useEffect(() => {
    if (filteredItems.length && !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0].id);
      return;
    }
    if (!filteredItems.length && selectedId) setSelectedId(null);
  }, [filteredItems, selectedId]);

  function openItem(item: NotificationItem) {
    setSelectedId(item.id);
    notifications.markRead(item.id);
  }

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (!filteredItems.length) return;

      const currentIndex = filteredItems.findIndex((item) => item.id === selected?.id);
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = filteredItems[Math.min(filteredItems.length - 1, Math.max(0, currentIndex + 1))];
        if (next) openItem(next);
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = filteredItems[Math.max(0, currentIndex <= 0 ? 0 : currentIndex - 1)];
        if (next) openItem(next);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredItems, selected]);

  const criticalCount = notifications.items.filter((item) => item.tone === "critical").length;
  const flaggedCount = notifications.items.filter((item) => item.flagged).length;
  const nextUnread = filteredItems.find((item) => !item.read && item.id !== selected?.id) ?? null;

  return (
    <div className="h-[calc(100svh-8.75rem)] min-h-[600px]">
      <Card className="border-border/70 sticky top-0 flex h-full flex-col overflow-hidden shadow-xs">
        <CardHeader className="shrink-0 gap-2 border-b px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border bg-muted/30 p-1.5">
                  <Mails className="size-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-[15px]">Inbox</CardTitle>
                  <div className="text-xs text-muted-foreground">All alerts and important system updates.</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <QuickChip
                  active={!showUnreadOnly && !showStarredOnly && toneFilter === "all"}
                  label={`All ${notifications.items.length}`}
                  onClick={() => {
                    setShowUnreadOnly(false);
                    setShowStarredOnly(false);
                    setToneFilter("all");
                  }}
                />
                <QuickChip active={showUnreadOnly} label={`Unread ${notifications.unreadCount}`} onClick={() => setShowUnreadOnly((value) => !value)} />
                <QuickChip active={showStarredOnly} label={`Flagged ${flaggedCount}`} onClick={() => setShowStarredOnly((value) => !value)} />
                <QuickChip active={toneFilter === "critical"} label={`Critical ${criticalCount}`} onClick={() => setToneFilter((value) => (value === "critical" ? "all" : "critical"))} />
                {(showUnreadOnly || showStarredOnly || toneFilter !== "all" || query.trim()) ? (
                  <QuickChip
                    active={false}
                    label="Reset"
                    onClick={() => {
                      setShowUnreadOnly(false);
                      setShowStarredOnly(false);
                      setToneFilter("all");
                      setQuery("");
                    }}
                  />
                ) : null}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="h-7 pl-9 text-xs" />
              </div>
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => notifications.markAllRead()} disabled={!notifications.unreadCount}>
                <CheckCheck className="mr-2 size-4" />
                Read all
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-0">
          <div className="grid h-full min-h-0 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
              <div className="shrink-0 flex items-center justify-between border-b px-4 py-2.5">
                <div className="text-sm font-medium">{filteredItems.length} message(s)</div>
                <div className="text-xs text-muted-foreground">{notifications.unreadCount} unread</div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pb-3">
                {filteredItems.length ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItem(item)}
                      className={[
                        "w-full border-b px-4 py-3 text-left transition hover:bg-muted/20",
                        selected?.id === item.id ? "bg-muted/30" : "",
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
                            <span className="text-[11px] text-muted-foreground">{item.facilityId ? getFacilityName(item.facilityId) : "Group"}</span>
                            <button
                              type="button"
                              aria-label={item.flagged ? "Unflag" : "Flag"}
                              onClick={(event) => {
                                event.stopPropagation();
                                notifications.toggleFlag(item.id);
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
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">No inbox items found.</div>
                )}
              </div>
            </div>

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
                        <Button size="sm" variant={selected.flagged ? "default" : "outline"} onClick={() => notifications.toggleFlag(selected.id)}>
                          <Flag className={selected.flagged ? "mr-2 size-4 fill-current" : "mr-2 size-4"} />
                          {selected.flagged ? "Flagged" : "Flag"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => (selected.read ? notifications.markUnread(selected.id) : notifications.markRead(selected.id))}>
                          {selected.read ? "Mark unread" : "Mark read"}
                        </Button>
                        {nextUnread ? (
                          <Button size="sm" variant="outline" onClick={() => openItem(nextUnread)}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickChip(props: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        props.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      ].join(" ")}
    >
      {props.label}
    </button>
  );
}

function toneWeight(tone: NotificationItem["tone"]) {
  switch (tone) {
    case "critical":
      return 4;
    case "warning":
      return 3;
    case "info":
      return 2;
    case "compliant":
      return 1;
    default:
      return 0;
  }
}

function toneIcon(tone: NotificationItem["tone"]) {
  switch (tone) {
    case "critical":
      return <Siren className="size-4 text-rose-500" />;
    case "warning":
      return <TriangleAlert className="size-4 text-amber-500" />;
    case "info":
      return <Info className="size-4 text-sky-500" />;
    case "compliant":
      return <CheckCheck className="size-4 text-emerald-500" />;
    default:
      return null;
  }
}

