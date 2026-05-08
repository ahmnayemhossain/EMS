import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { PageHeader } from "@/core/components/PageHeader";

import { NotificationDrawer } from "@/features/NotificationsPage/NotificationDrawer";
import { NotificationsList } from "@/features/NotificationsPage/NotificationsList";
import { NotificationsToolbar } from "@/features/NotificationsPage/NotificationsToolbar";
import { useNotificationsPage } from "@/features/NotificationsPage/use-notifications-page";

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

