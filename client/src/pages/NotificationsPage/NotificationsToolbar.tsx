import { Bell, Flag } from "lucide-react";

import { Button } from "@/app/components/ui/button";

type NotificationsToolbarProps = {
  flaggedCount: number;
  showFlaggedOnly: boolean;
  toggleFlaggedOnly: () => void;
  markAllRead: () => void;
};

export function NotificationsToolbar(props: NotificationsToolbarProps) {
  return <div className="flex items-center gap-2"><Button variant={props.showFlaggedOnly ? "destructive" : "outline"} onClick={props.toggleFlaggedOnly}><Flag className={props.showFlaggedOnly ? "mr-2 size-4 fill-current" : "mr-2 size-4"} />Flagged ({props.flaggedCount})</Button><Button variant="outline" onClick={props.markAllRead}><Bell className="mr-2 size-4" />Mark all read</Button></div>;
}
