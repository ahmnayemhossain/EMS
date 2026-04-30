import { getFacilityName } from "@/core/data/mock";
import type { ReportBoxRecord } from "@/core/types/ems";

import { formatReportNumber, getAttachmentSrc, stripEmsNotePrefix } from "@/features/ComplaintBoxPage/utils";

export function buildRecordHtml(record: ReportBoxRecord) {
  const report = record.snapshot;
  const title = report.subject?.trim() || formatReportNumber(report.id);
  const companyName = report.facilityId ? getFacilityName(report.facilityId) : "Unknown company";
  const createdAt = new Date(report.createdAt).toLocaleString();
  const recordedAt = new Date(record.recordedAt).toLocaleString();
  const messagesHtml = report.messages.map(buildMessageHtml).join("");

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)}</title>${getRecordStyles()}</head><body><div class="wrap"><div class="card"><div class="header"><div><div class="pill">EMS Platform</div><h1 class="h1" style="margin-top:10px;">${escapeHtml(title)}</h1><div class="meta"><div><b>Complaint #</b> ${formatReportNumber(report.id)} · <b>${escapeHtml(companyName)}</b></div><div><b>Created</b> ${createdAt} · <b>Recorded</b> ${recordedAt}</div><div><b>Status</b> ${escapeHtml(report.status)}${buildMetaTags(report)}</div></div></div></div><div class="content">${messagesHtml || getEmptyMessageHtml()}</div></div></div></body></html>`;
}

function buildMessageHtml(message: ReportBoxRecord["snapshot"]["messages"][number]) {
  const at = new Date(message.at).toLocaleString();
  const isNote = message.kind === "text" && (message.text || "").toLowerCase().startsWith("ems note:");
  const text = isNote ? stripEmsNotePrefix(message.text) : message.text || "";
  const media = buildMessageMedia(message);
  return `<div style="${getMessageStyle(isNote)}"><div style="font-size:11px;color:rgba(100,116,139,.95);margin-bottom:6px;">${isNote ? "<b>NOTE</b> · " : ""}${at}</div>${text ? `<div style="font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(text)}</div>` : ""}${media}</div>`;
}

function buildMessageMedia(message: ReportBoxRecord["snapshot"]["messages"][number]) {
  const src = getAttachmentSrc(message.attachment);
  if (!src || message.kind === "text") return "";
  if (message.kind === "photo") return `<img src="${src}" alt="photo" style="max-width:100%;border-radius:12px;margin-top:8px;background:rgba(148,163,184,.12);" />`;
  return `<audio controls src="${src}" style="width:100%;margin-top:8px;"></audio>`;
}

function buildMetaTags(report: ReportBoxRecord["snapshot"]) {
  return `${report.flagged ? " · <b>Flagged</b>" : ""}${report.category ? ` · <b>Category</b> ${escapeHtml(report.category)}` : ""}${report.assignedTo ? ` · <b>Supervisor</b> ${escapeHtml(report.assignedTo)}` : ""}${report.handledBy ? ` · <b>Handler</b> ${escapeHtml(report.handledBy)}` : ""}`;
}

function getMessageStyle(isNote: boolean) {
  return `margin:12px 0;padding:12px;border-radius:16px;border:1px ${isNote ? "dashed" : "solid"} ${isNote ? "rgba(148,163,184,.55)" : "rgba(34,197,94,.25)"};background:${isNote ? "rgba(148,163,184,.08)" : "rgba(34,197,94,.08)"};`;
}

function getRecordStyles() {
  return `<style>:root{color-scheme:light;}body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,"Noto Sans","Helvetica Neue";margin:0;background:#f8fafc;color:#0f172a;}.wrap{max-width:920px;margin:24px auto;padding:0 16px;}.card{background:#fff;border:1px solid rgba(148,163,184,.5);border-radius:18px;box-shadow:0 10px 25px rgba(2,6,23,.06);}.header{padding:16px 18px;border-bottom:1px solid rgba(148,163,184,.35);display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}.h1{font-size:16px;font-weight:700;margin:0;}.meta{font-size:12px;color:rgba(100,116,139,.95);margin-top:4px;line-height:1.45;}.pill{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;border:1px solid rgba(148,163,184,.5);background:rgba(148,163,184,.08);}.content{padding:16px 18px;}@media print{body{background:#fff;}.wrap{margin:0;max-width:none;padding:0;}.card{border:0;box-shadow:none;border-radius:0;}}</style>`;
}

function getEmptyMessageHtml() {
  return "<div style='color:rgba(100,116,139,.95);font-size:13px;'>No messages.</div>";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
