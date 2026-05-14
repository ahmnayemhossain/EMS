import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import {
  ensureDirectory,
  getCdnPublicBase,
  resolveCdnPath,
  sanitizeFilePart,
  toCdnUrl,
} from "../../../core/shared/storage.js";

const REPORT_BOX_DIR = "report-box/inbox";
const INDEX_FILE = "index.json";

export async function submitReportBoxHandler(req, res, next) {
  try {
    const body = req.body || {};
    const companyId = asOptionalString(body.companyId);
    const reportId = asOptionalString(body.reportId);
    const kind = asRequiredKind(body.kind);
    const at = asIso(body.at) || new Date().toISOString();

    if (!companyId) {
      return res.status(400).json({ ok: false, error: "company_id_required" });
    }

    if (kind === "text" && !asOptionalString(body.text)?.trim()) {
      return res.status(400).json({ ok: false, error: "text_required" });
    }

    if ((kind === "voice" || kind === "photo") && !asOptionalString(body.dataUrl)) {
      return res.status(400).json({ ok: false, error: "attachment_required" });
    }

    const inbox = await loadInboxState();
    const report = reportId ? await findReportById(inbox, reportId) : null;
    const nextReport = report ?? createEmptyReport(companyId, at, kind, asOptionalString(body.text));
    const messageId = createId("msg");

    const message = {
      id: messageId,
      at,
      kind,
      text: kind === "text" ? asOptionalString(body.text)?.trim() || undefined : undefined,
      durationSec: kind === "voice" ? asPositiveNumber(body.durationSec) : undefined,
      author: undefined,
    };

    if (kind === "voice" || kind === "photo") {
      const saved = await saveDataUrlFile({
        reportId: nextReport.id,
        messageId,
        dataUrl: String(body.dataUrl),
        mime: asOptionalString(body.mime) || undefined,
      });
      message.mediaFile = saved.relativePath;
      message.mime = saved.mime;
      message.url = toCdnUrl(saved.relativePath);
    }

    nextReport.messages = [...(nextReport.messages || []), message];
    nextReport.subject = nextReport.subject || buildSubjectFromMessage(message);

    await upsertReport(inbox, nextReport);

    res.json({ ok: true, reportId: nextReport.id, messageId });
  } catch (error) {
    next(error);
  }
}

export async function editReportBoxMessageHandler(req, res, next) {
  try {
    const reportId = asOptionalString(req.body?.reportId);
    const messageId = asOptionalString(req.body?.messageId);
    const text = asOptionalString(req.body?.text)?.trim();

    if (!reportId || !messageId || !text) {
      return res.status(400).json({ ok: false, error: "invalid_request" });
    }

    const inbox = await loadInboxState();
    const report = await findReportById(inbox, reportId);
    if (!report) return res.status(404).json({ ok: false, error: "report_not_found" });

    let found = false;
    report.messages = (report.messages || []).map((message) => {
      if (message.id !== messageId) return message;
      found = true;
      return { ...message, text };
    });

    if (!found) return res.status(404).json({ ok: false, error: "message_not_found" });

    await upsertReport(inbox, report);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function deleteReportBoxMessageHandler(req, res, next) {
  try {
    const reportId = asOptionalString(req.body?.reportId);
    const messageId = asOptionalString(req.body?.messageId);

    if (!reportId || !messageId) {
      return res.status(400).json({ ok: false, error: "invalid_request" });
    }

    const inbox = await loadInboxState();
    const report = await findReportById(inbox, reportId);
    if (!report) return res.status(404).json({ ok: false, error: "report_not_found" });

    const message = (report.messages || []).find((item) => item.id === messageId);
    if (!message) return res.status(404).json({ ok: false, error: "message_not_found" });

    if (message.mediaFile) {
      await removeRelativeFile(message.mediaFile);
    }

    report.messages = (report.messages || []).filter((item) => item.id !== messageId);
    if (!report.messages.length) {
      await removeReport(inbox, report.id);
    } else {
      await upsertReport(inbox, report);
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function deleteReportBoxReportHandler(req, res, next) {
  try {
    const reportId = asOptionalString(req.body?.id);
    if (!reportId) {
      return res.status(400).json({ ok: false, error: "report_id_required" });
    }

    const inbox = await loadInboxState();
    const report = await findReportById(inbox, reportId);
    if (!report) return res.json({ ok: true });

    await removeReport(inbox, report.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function loadInboxState() {
  const root = resolveCdnPath(REPORT_BOX_DIR);
  await ensureDirectory(root);
  const indexPath = path.join(root, INDEX_FILE);

  let index = [];
  try {
    const raw = await fs.readFile(indexPath, "utf8");
    const parsed = JSON.parse(raw);
    index = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  return { root, indexPath, index };
}

async function findReportById(inbox, reportId) {
  const item = inbox.index.find((entry) => entry.id === reportId);
  if (!item?.reportFile) return null;
  const reportPath = path.join(inbox.root, item.reportFile);
  try {
    const raw = await fs.readFile(reportPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function createEmptyReport(companyId, createdAt, kind, text) {
  const reportId = createId("rpt");
  return {
    id: reportId,
    createdAt,
    companyId,
    subject: buildSubjectFromMessage({ kind, text }),
    flagged: false,
    status: "new",
    assignedTo: undefined,
    messages: [],
  };
}

function buildSubjectFromMessage(message) {
  if (message.kind === "text") {
    const text = String(message.text || "").trim();
    if (text) return text.slice(0, 80);
    return "New complaint";
  }
  if (message.kind === "voice") return "Voice complaint";
  if (message.kind === "photo") return "Photo complaint";
  return "New complaint";
}

async function upsertReport(inbox, report) {
  const reportFile = `${sanitizeFilePart(report.id)}.json`;
  const reportPath = path.join(inbox.root, reportFile);

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  const nextIndexItem = {
    id: report.id,
    createdAt: report.createdAt,
    companyId: report.companyId,
    subject: report.subject,
    reportFile,
    flagged: Boolean(report.flagged),
    status: report.status || "new",
    assignedTo: report.assignedTo,
  };

  const nextIndex = inbox.index.filter((entry) => entry.id !== report.id);
  nextIndex.unshift(nextIndexItem);
  await fs.writeFile(inbox.indexPath, JSON.stringify(nextIndex, null, 2), "utf8");
  inbox.index = nextIndex;
}

async function removeReport(inbox, reportId) {
  const report = await findReportById(inbox, reportId);
  if (report?.messages?.length) {
    for (const message of report.messages) {
      if (message.mediaFile) {
        await removeRelativeFile(message.mediaFile);
      }
    }
  }

  const reportFile = `${sanitizeFilePart(reportId)}.json`;
  await fs.rm(path.join(inbox.root, reportFile), { force: true });

  const nextIndex = inbox.index.filter((entry) => entry.id !== reportId);
  await fs.writeFile(inbox.indexPath, JSON.stringify(nextIndex, null, 2), "utf8");
  inbox.index = nextIndex;
}

async function saveDataUrlFile({ reportId, messageId, dataUrl, mime }) {
  const parsed = parseDataUrl(dataUrl);
  const effectiveMime = mime || parsed.mime;
  const ext = mimeToExtension(effectiveMime);
  const mediaDir = resolveCdnPath(path.join(REPORT_BOX_DIR, "media"));
  await ensureDirectory(mediaDir);
  const fileName = `${sanitizeFilePart(reportId)}_${sanitizeFilePart(messageId)}.${ext}`;
  const absolutePath = path.join(mediaDir, fileName);
  const relativePath = path.join(REPORT_BOX_DIR, "media", fileName).replace(/\\/g, "/");

  await fs.writeFile(absolutePath, parsed.buffer);

  return {
    mime: effectiveMime,
    relativePath,
  };
}

async function removeRelativeFile(relativePath) {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  if (!normalized) return;
  await fs.rm(resolveCdnPath(normalized), { force: true });
}

function parseDataUrl(value) {
  const match = String(value).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("invalid_data_url");
  }
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function mimeToExtension(mime) {
  if (mime === "audio/webm") return "webm";
  if (mime === "audio/mpeg") return "mp3";
  if (mime === "audio/wav") return "wav";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

function asOptionalString(value) {
  return typeof value === "string" ? value : undefined;
}

function asPositiveNumber(value) {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : undefined;
}

function asIso(value) {
  if (typeof value !== "string") return undefined;
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? undefined : at.toISOString();
}

function asRequiredKind(value) {
  return value === "text" || value === "voice" || value === "photo" ? value : null;
}
