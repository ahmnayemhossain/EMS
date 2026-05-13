import { CheckCheck, Info, Siren, TriangleAlert } from "lucide-react";

import type { NotificationItem } from "@/core/app/state/slices/notifications";

export function toneWeight(tone: NotificationItem["tone"]) {
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

export function toneIcon(tone: NotificationItem["tone"]) {
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

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
