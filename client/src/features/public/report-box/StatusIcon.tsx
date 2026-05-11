import { CheckCheck, LoaderCircle, TriangleAlert } from "lucide-react";

import type { LocalMessage } from "@/features/public/report-box/types";

export function StatusIcon({ message }: { message: LocalMessage }) {
  if (message.from !== "worker" || !message.status) return null;
  if (message.status === "sending") return <LoaderCircle className="size-4 animate-spin text-muted-foreground" />;
  if (message.status === "success") return <CheckCheck className="size-4 text-[var(--success-700)]" />;
  return <TriangleAlert className="size-4 text-destructive" />;
}
