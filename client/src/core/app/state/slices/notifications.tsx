import type { Notification } from "@/core/types/models/ems";
import { notifications as seedNotifications } from "@/core/data/catalog/mock";
import { create } from "zustand";
import { shallow } from "zustand/shallow";

export type NotificationItem = Notification & { flagged: boolean };

type NotificationsStore = {
  items: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  toggleFlag: (id: string) => void;
};

const useNotificationsStore = create<NotificationsStore>((set) => ({
  items: seedNotifications.map((n) => ({ ...n, flagged: false })),
  unreadCount: seedNotifications.filter((n) => !n.read).length,
  markAllRead: () =>
    set((state) => {
      const nextItems = state.items.map((n) => ({ ...n, read: true }));
      return { items: nextItems, unreadCount: 0 };
    }),
  markRead: (id: string) =>
    set((state) => {
      const nextItems = state.items.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      const unreadCount = nextItems.filter((n) => !n.read).length;
      return { items: nextItems, unreadCount };
    }),
  markUnread: (id: string) =>
    set((state) => {
      const nextItems = state.items.map((n) =>
        n.id === id ? { ...n, read: false } : n,
      );
      const unreadCount = nextItems.filter((n) => !n.read).length;
      return { items: nextItems, unreadCount };
    }),
  toggleFlag: (id: string) =>
    set((state) => ({
      items: state.items.map((n) =>
        n.id === id ? { ...n, flagged: !n.flagged } : n,
      ),
    })),
}));

export function useNotifications() {
  return useNotificationsStore(
    (s) => ({
      items: s.items,
      unreadCount: s.unreadCount,
      markAllRead: s.markAllRead,
      markRead: s.markRead,
      markUnread: s.markUnread,
      toggleFlag: s.toggleFlag,
    }),
    shallow,
  );
}
