import type { ReportBoxRecord, ReportBoxReport } from "@/core/types/models/ems";

import { RECORDS_KEY, REPORTS_KEY } from "@/core/app/state/report-box/constants";

function safeParseArray<T>(raw: string | null): T[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function safeLocalStorageGet(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function readPersistedReports(): ReportBoxReport[] {
  const raw = safeLocalStorageGet(REPORTS_KEY);
  const parsed = safeParseArray<ReportBoxReport>(raw);
  return parsed && parsed.length ? parsed : [];
}

export function readPersistedRecords(): ReportBoxRecord[] {
  const raw = safeLocalStorageGet(RECORDS_KEY);
  const parsed = safeParseArray<ReportBoxRecord>(raw);
  return parsed && parsed.length ? parsed : [];
}

export function persistReports(reports: ReportBoxReport[]) {
  safeLocalStorageSet(REPORTS_KEY, JSON.stringify(reports));
}

export function persistRecords(records: ReportBoxRecord[]) {
  safeLocalStorageSet(RECORDS_KEY, JSON.stringify(records));
}
