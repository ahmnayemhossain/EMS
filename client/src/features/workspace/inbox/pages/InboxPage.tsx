import * as React from "react";
import { CheckCheck, Mails, Search } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { useNotifications, type NotificationItem } from "@/core/app/state/slices/notifications";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { getCompanyName } from "@/core/companies/directory";
import { InboxDetailPane } from "../components/InboxDetailPane";
import { InboxListPane } from "../components/InboxListPane";
import { QuickChip } from "../components/QuickChip";
import { toneWeight } from "../utils/inbox-display";

export function InboxPage() {
  const notifications = useNotifications();
  const { companies } = useSelectedCompany();
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
    if (selectedId && !notifications.items.some((item) => item.id === selectedId)) {
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
          item.facilityId ? getCompanyName(item.facilityId, companies) : "group",
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
  }, [companies, notifications.items, query, showStarredOnly, showUnreadOnly, toneFilter]);

  const selected = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;

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
            <InboxListPane
              items={filteredItems}
              selectedId={selected?.id ?? null}
              unreadCount={notifications.unreadCount}
              onOpenItem={openItem}
              onToggleFlag={notifications.toggleFlag}
            />

            <InboxDetailPane
              selected={selected}
              nextUnread={nextUnread}
              onOpenItem={openItem}
              onToggleFlag={notifications.toggleFlag}
              onToggleRead={(item) => (item.read ? notifications.markUnread(item.id) : notifications.markRead(item.id))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
