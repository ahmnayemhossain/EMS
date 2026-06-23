import type { ID } from "@/core/types/ems/core";

export type ReportBoxMessageKind = "text" | "voice" | "photo";

export type ReportBoxAttachment = {
  mime: string;
  name?: string;
  dataUrl?: string; // base64 data url for local-only storage
  url?: string; // public URL (e.g. from /cdn/report-box/inbox/*)
};

export type ReportBoxMessage = {
  id: ID;
  at: string; // ISO date-time
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
  author?: string; // internal notes / replies
};

export type ReportBoxReport = {
  id: ID;
  createdAt: string; // ISO date-time
  facilityId?: ID;
  channel: "public" | "internal";
  origin?: "inbox" | "local";
  status: "new" | "triaged" | "handled";
  flagged: boolean;
  subject: string;
  category?: string;
  messages: ReportBoxMessage[];
  assignedTo?: string;
  handledAt?: string; // ISO date-time
  handledBy?: string;
};

export type ReportBoxRecord = {
  id: ID;
  reportId: ID;
  recordedAt: string; // ISO date-time
  title: string;
  snapshot: ReportBoxReport;
};


