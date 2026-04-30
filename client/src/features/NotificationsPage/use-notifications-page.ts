import * as React from "react";

import { useNotifications } from "@/core/app/state/notifications";

export function useNotificationsPage() {
  const notifications = useNotifications();
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showFlaggedOnly, setShowFlaggedOnly] = React.useState(false);
  const selected = React.useMemo(() => selectedId ? notifications.items.find((item) => item.id === selectedId) : undefined, [notifications.items, selectedId]);
  const flaggedCount = React.useMemo(() => notifications.items.filter((item) => item.flagged).length, [notifications.items]);
  const visibleItems = React.useMemo(() => showFlaggedOnly ? notifications.items.filter((item) => item.flagged) : notifications.items, [notifications.items, showFlaggedOnly]);
  return { ...notifications, viewOpen, selectedId, selected, flaggedCount, visibleItems, showFlaggedOnly, setViewOpen, setSelectedId, setShowFlaggedOnly };
}
