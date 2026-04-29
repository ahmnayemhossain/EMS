import type { ReportBoxAttachment, ReportBoxMessageKind } from "@/types/ems";

export type LocalMessage = {
  id: string;
  at: string;
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
  from: "worker" | "ems";
  emphasis?: "normal" | "success";
  action?: "new_report";
  status?: "sending" | "success" | "error";
  serverMessageId?: string;
};
