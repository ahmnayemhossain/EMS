import { Mail } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { useNotifications } from "@/core/app/state/slices/notifications";

export function NotificationsButton() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Inbox"
      onClick={() => navigate("/inbox")}
      className="relative size-8 rounded-lg p-0"
    >
      <Mail className="size-4" />
      {unreadCount > 0 ? (
        <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 grid min-w-[16px] place-items-center rounded-full px-1 text-[10px] font-semibold leading-none ring-2 ring-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Button>
  );
}

