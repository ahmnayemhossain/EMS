import type {
  ReportBoxAttachment,
  ReportBoxMessageKind,
  ReportBoxRecord,
  ReportBoxReport,
} from "@/core/types/ems";

export type NewReportInput = {
  facilityId?: string;
  subject: string;
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
};

export type NewMessageInput = {
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
  author?: string;
};

export type ReportBoxApi = {
  reports: ReportBoxReport[];
  records: ReportBoxRecord[];
  addReport: (input: NewReportInput) => string;
  setSubject: (id: string, subject: string) => void;
  addRecord: (reportId: string) => string | null;
  removeRecord: (recordId: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (
    id: string,
    status: ReportBoxReport["status"],
    meta?: { handledBy?: string },
  ) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignee?: string) => void;
  addMessage: (id: string, input: NewMessageInput) => void;
  removeReport: (id: string) => void;
  deleteReport: (id: string) => Promise<void>;
  refreshFromInbox: () => Promise<void>;
};

