import type { ReportBoxReport } from "@/core/types/ems";

import type { PendingNote } from "@/features/ComplaintBoxPage/drawer/state-helpers";

export type DrawerMessageInput = { kind: "text"; text: string; author?: string };

export type UseComplaintDrawerStateArgs = {
  complaint: ReportBoxReport | null;
  currentUserLabel: string;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
  addMessage: (id: string, message: DrawerMessageInput) => void;
};

export type SaveComplaintDrawerArgs = {
  complaint: ReportBoxReport | null;
  titleDraft: string;
  categoryDraft: string;
  assigneeDraft: string;
  statusDraft: ReportBoxReport["status"];
  flaggedDraft: boolean;
  noteDraft: string;
  pendingNotes: PendingNote[];
  currentUserLabel: string;
  validateDrawer: () => string | null;
  noteInputRef: { current: HTMLTextAreaElement | null };
  setShowValidation: (value: boolean) => void;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
  addMessage: (id: string, message: DrawerMessageInput) => void;
  clearNotes: () => void;
};

export type ComplaintDrawerBodyProps = {
  complaint: ReportBoxReport;
  currentUserLabel: string;
  reportAssignees: string[];
  addRecord: (reportId: string) => string | undefined;
  onSwitchToRecords: () => void;
  onRequestDeleteComplaint: (report: ReportBoxReport) => void;
  onPreviewImage: (src: string, alt: string) => void;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
  addMessage: (id: string, message: DrawerMessageInput) => void;
};
