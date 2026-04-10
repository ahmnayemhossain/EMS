import * as React from "react";

import type { Notification } from "@/types/ems";
import { notifications as seedNotifications } from "@/data/mock";

export type NotificationItem = Notification & { flagged: boolean };

type NotificationsContextValue = {
  items: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  toggleFlag: (id: string) => void;
};

const NotificationsContext =
  React.createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = React.useState<NotificationItem[]>(() =>
    seedNotifications.map((n) => ({ ...n, flagged: false })),
  );

  const unreadCount = React.useMemo(
    () => items.filter((n) => !n.read).length,
    [items],
  );

  const markAllRead = React.useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markUnread = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
    );
  }, []);

  const toggleFlag = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, flagged: !n.flagged } : n)),
    );
  }, []);

  const value = React.useMemo(
    () => ({ items, unreadCount, markAllRead, markRead, markUnread, toggleFlag }),
    [items, unreadCount, markAllRead, markRead, markUnread, toggleFlag],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
