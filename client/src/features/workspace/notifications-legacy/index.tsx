import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { PageHeader } from "@/components/layout/primitives/PageHeader";

import { NotificationDrawer } from './NotificationDrawer';
import { NotificationsList } from './NotificationsList';
import { NotificationsToolbar } from './NotificationsToolbar';
import { useNotificationsPage } from './use-notifications-page';

export function NotificationsPage() {
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
          <CardTitle>Inbox</CardTitle>
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

