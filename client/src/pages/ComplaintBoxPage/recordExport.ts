import { getFacilityName } from "@/data/mock";
import type { ReportBoxRecord } from "@/types/ems";

import { formatReportNumber, getAttachmentSrc, stripEmsNotePrefix } from "@/pages/ComplaintBoxPage/utils";

function escapeHtml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getRecordCompanyName(r: ReportBoxRecord) {
  const fid = r.snapshot.facilityId;
  return fid ? getFacilityName(fid) : "Unknown company";
}

export function buildRecordHtml(r: ReportBoxRecord) {
  const report = r.snapshot;
  const title = report.subject?.trim() || formatReportNumber(report.id);
  const companyName = report.facilityId ? getFacilityName(report.facilityId) : "Unknown company";
  const createdAt = new Date(report.createdAt).toLocaleString();
  const recordedAt = new Date(r.recordedAt).toLocaleString();

  const messagesHtml = report.messages
    .map((m) => {
      const at = new Date(m.at).toLocaleString();
      const isNote = m.kind === "text" && (m.text || "").toLowerCase().startsWith("ems note:");
      const text = isNote ? stripEmsNotePrefix(m.text) : m.text || "";
      const safeText = escapeHtml(text);
      const media =
        m.kind === "photo" && getAttachmentSrc(m.attachment)
          ? `<img src="${getAttachmentSrc(m.attachment)}" alt="photo" style="max-width:100%;border-radius:12px;margin-top:8px;background:rgba(148,163,184,.12);" />`
          : m.kind === "voice" && getAttachmentSrc(m.attachment)
            ? `<audio controls src="${getAttachmentSrc(m.attachment)}" style="width:100%;margin-top:8px;"></audio>`
            : "";

      return `
        <div style="margin:12px 0;padding:12px;border-radius:16px;border:1px ${isNote ? "dashed" : "solid"} ${isNote ? "rgba(148,163,184,.55)" : "rgba(34,197,94,.25)"};background:${isNote ? "rgba(148,163,184,.08)" : "rgba(34,197,94,.08)"};">
          <div style="font-size:11px;color:rgba(100,116,139,.95);margin-bottom:6px;">${isNote ? "<b>NOTE</b> · " : ""}${at}</div>
          ${safeText ? `<div style="font-size:14px;line-height:1.5;white-space:pre-wrap;">${safeText}</div>` : ""}
          ${media}
        </div>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue"; margin: 0; background: #f8fafc; color:#0f172a; }
      .wrap { max-width: 920px; margin: 24px auto; padding: 0 16px; }
      .card { background: #fff; border: 1px solid rgba(148,163,184,.5); border-radius: 18px; box-shadow: 0 10px 25px rgba(2,6,23,.06); }
      .header { padding: 16px 18px; border-bottom: 1px solid rgba(148,163,184,.35); display:flex; justify-content:space-between; gap:12px; align-items:flex-start;}
      .h1 { font-size: 16px; font-weight: 700; margin: 0; }
      .meta { font-size: 12px; color: rgba(100,116,139,.95); margin-top: 4px; line-height:1.45; }
      .pill { display:inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; border: 1px solid rgba(148,163,184,.5); background: rgba(148,163,184,.08); }
      .content { padding: 16px 18px; }
      @media print {
        body { background: #fff; }
        .wrap { margin: 0; max-width: none; padding: 0; }
        .card { border: 0; box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="header">
          <div>
            <div class="pill">EMS Platform</div>
            <h1 class="h1" style="margin-top:10px;">${escapeHtml(title)}</h1>
            <div class="meta">
              <div><b>Complaint #</b> ${formatReportNumber(report.id)} · <b>${escapeHtml(companyName)}</b></div>
              <div><b>Created</b> ${createdAt} · <b>Recorded</b> ${recordedAt}</div>
              <div><b>Status</b> ${escapeHtml(report.status)}${report.flagged ? " · <b>Flagged</b>" : ""}${report.category ? ` · <b>Category</b> ${escapeHtml(report.category)}` : ""}${report.assignedTo ? ` · <b>Supervisor</b> ${escapeHtml(report.assignedTo)}` : ""}${report.handledBy ? ` · <b>Handler</b> ${escapeHtml(report.handledBy)}` : ""}</div>
            </div>
          </div>
        </div>
        <div class="content">
          ${messagesHtml || "<div style='color:rgba(100,116,139,.95);font-size:13px;'>No messages.</div>"}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function downloadRecord(r: ReportBoxRecord) {
  const html = buildRecordHtml(r);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `complaint-record_${formatReportNumber(r.reportId).replace("/", "-")}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function printRecord(r: ReportBoxRecord) {
  const html = buildRecordHtml(r);
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch {
      // ignore
    }
  }, 250);
}

export function getRecordSearchHaystack(r: ReportBoxRecord) {
  return [
    formatReportNumber(r.reportId),
    r.snapshot.subject,
    r.snapshot.assignedTo || "",
    r.snapshot.category || "",
    getRecordCompanyName(r),
  ]
    .join(" ")
    .toLowerCase();
}

