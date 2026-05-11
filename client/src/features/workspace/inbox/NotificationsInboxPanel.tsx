import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { PageHeader } from "@/components/layout/primitives/PageHeader";

import { NotificationDrawer } from "@/features/workspace/notifications-legacy/NotificationDrawer";
import { NotificationsList } from "@/features/workspace/notifications-legacy/NotificationsList";
import { NotificationsToolbar } from "@/features/workspace/notifications-legacy/NotificationsToolbar";
import { useNotificationsPage } from "@/features/workspace/notifications-legacy/use-notifications-page";

export function NotificationsInboxPanel() {
  const page = useNotificationsPage();
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <NotificationsToolbar
            flaggedCount={page.flaggedCount}
            showFlaggedOnly={page.showFlaggedOnly}
            toggleFlaggedOnly={() => page.setShowFlaggedOnly((value) => !value)}
            markAllRead={page.markAllRead}
          />
        }
      />

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <NotificationsList
            items={page.visibleItems}
            markRead={page.markRead}
            markUnread={page.markUnread}
            toggleFlag={page.toggleFlag}
            openItem={(id) => {
              page.setSelectedId(id);
              page.setViewOpen(true);
              page.markRead(id);
            }}
          />
        </CardContent>
      </Card>

      <NotificationDrawer
        open={page.viewOpen}
        selected={page.selected}
        setOpen={page.setViewOpen}
        markRead={page.markRead}
        markUnread={page.markUnread}
        toggleFlag={page.toggleFlag}
      />
    </div>
  );
}


