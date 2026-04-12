import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import fs from "fs/promises";

function reportBoxInboxPlugin() {
  const maxBodyBytes = 15 * 1024 * 1024;
  const DEFAULT_SUBJECT = "কর্মী রিপোর্ট";
  const VOICE_SUBJECT = "ভয়েস রিপোর্ট";
  const PHOTO_SUBJECT = "ছবি রিপোর্ট";

  async function readJsonSafe(filePath: string) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async function readTextSafe(filePath: string) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch {
      return "";
    }
  }

  async function parseJsonBody(req: any) {
    const chunks: Buffer[] = [];
    let total = 0;
    await new Promise<void>((resolve, reject) => {
      req.on("data", (c: Buffer) => {
        total += c.length;
        if (total > maxBodyBytes) {
          reject(new Error("Payload too large"));
          return;
        }
        chunks.push(c);
      });
      req.on("end", () => resolve());
      req.on("error", (e: unknown) => reject(e));
    });
    const raw = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(raw);
  }

  async function inferSubjectFromDoc(reportDoc: any, inboxDir: string) {
    const msgs = Array.isArray(reportDoc?.messages) ? reportDoc.messages : [];
    const first = msgs[0];
    if (!first) return DEFAULT_SUBJECT;
    if (String(first.kind) === "text" && first.textFile) {
      const t = (await readTextSafe(path.join(inboxDir, String(first.textFile))))
        .trim()
        .replace(/\\s+/g, " ")
        .slice(0, 80);
      return t || DEFAULT_SUBJECT;
    }
    if (String(first.kind) === "voice") return VOICE_SUBJECT;
    if (String(first.kind) === "photo") return PHOTO_SUBJECT;
    return DEFAULT_SUBJECT;
  }

  return {
    name: "ems-report-box-inbox",
    configureServer(server: any) {
      server.middlewares.use("/api/report-box/delete", async (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          await new Promise<void>((resolve, reject) => {
            req.on("data", (c: Buffer) => chunks.push(c));
            req.on("end", () => resolve());
            req.on("error", (e: unknown) => reject(e));
          });
          const raw = Buffer.concat(chunks).toString("utf8");
          const body = JSON.parse(raw) as { id: string };
          const id = String(body.id || "").trim();
          if (!id) throw new Error("Missing id");

          const inboxDir = path.resolve(__dirname, "public/report-box/inbox");
          const indexPath = path.join(inboxDir, "index.json");

          let index: any[] = [];
          try {
            const existing = await fs.readFile(indexPath, "utf8");
            const parsed = JSON.parse(existing);
            if (Array.isArray(parsed)) index = parsed;
          } catch {
            // ignore
          }

          const hit = index.find((x) => x?.id === id);
          index = index.filter((x) => x?.id !== id);

          // Delete report file + all message files referenced within it (if present)
          if (hit?.reportFile) {
            const reportPath = path.join(inboxDir, String(hit.reportFile));
            try {
              const reportRaw = await fs.readFile(reportPath, "utf8");
              const reportDoc = JSON.parse(reportRaw);
              const msgs = Array.isArray(reportDoc?.messages) ? reportDoc.messages : [];
              for (const m of msgs) {
                if (m?.textFile) {
                  try {
                    await fs.unlink(path.join(inboxDir, String(m.textFile)));
                  } catch {
                    // ignore
                  }
                }
                if (m?.mediaFile) {
                  try {
                    await fs.unlink(path.join(inboxDir, String(m.mediaFile)));
                  } catch {
                    // ignore
                  }
                }
              }
            } catch {
              // ignore
            }
            try {
              await fs.unlink(reportPath);
            } catch {
              // ignore
            }
          }

          await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf8");

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (e: any) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: e?.message || "Bad request" }));
        }
      });

      server.middlewares.use("/api/report-box/message/edit", async (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
          return;
        }

        try {
          const body = (await parseJsonBody(req)) as { reportId: string; messageId: string; text: string };
          const reportId = String(body.reportId || "").trim();
          const messageId = String(body.messageId || "").trim();
          const text = String(body.text || "");
          if (!reportId || !messageId) throw new Error("Missing reportId/messageId");

          const inboxDir = path.resolve(__dirname, "public/report-box/inbox");
          await fs.mkdir(inboxDir, { recursive: true });
          const indexPath = path.join(inboxDir, "index.json");
          const reportFile = `${reportId}.json`;
          const reportPath = path.join(inboxDir, reportFile);

          const reportDoc = (await readJsonSafe(reportPath)) as any;
          if (!reportDoc || typeof reportDoc !== "object") throw new Error("Report not found");
          reportDoc.messages = Array.isArray(reportDoc.messages) ? reportDoc.messages : [];

          const msg = reportDoc.messages.find((m: any) => String(m?.id) === messageId);
          if (!msg || String(msg.kind) !== "text" || !msg.textFile) throw new Error("Message not editable");

          await fs.writeFile(path.join(inboxDir, String(msg.textFile)), text, "utf8");

          if (reportDoc.messages[0] && String(reportDoc.messages[0].id) === messageId) {
            const trimmed = text.trim().replace(/\\s+/g, " ").slice(0, 80);
            reportDoc.subject = trimmed || DEFAULT_SUBJECT;
          }

          await fs.writeFile(reportPath, JSON.stringify(reportDoc, null, 2), "utf8");

          const existingIndex = (await readJsonSafe(indexPath)) as any;
          const index: any[] = Array.isArray(existingIndex) ? existingIndex : [];
          const hit = index.find((x) => x?.id === reportId);
          if (hit) hit.subject = String(reportDoc.subject || DEFAULT_SUBJECT);
          await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf8");

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (e: any) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: e?.message || "Bad request" }));
        }
      });

      server.middlewares.use("/api/report-box/message/delete", async (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
          return;
        }

        try {
          const body = (await parseJsonBody(req)) as { reportId: string; messageId: string };
          const reportId = String(body.reportId || "").trim();
          const messageId = String(body.messageId || "").trim();
          if (!reportId || !messageId) throw new Error("Missing reportId/messageId");

          const inboxDir = path.resolve(__dirname, "public/report-box/inbox");
          await fs.mkdir(inboxDir, { recursive: true });
          const indexPath = path.join(inboxDir, "index.json");
          const reportFile = `${reportId}.json`;
          const reportPath = path.join(inboxDir, reportFile);

          const reportDoc = (await readJsonSafe(reportPath)) as any;
          if (!reportDoc || typeof reportDoc !== "object") throw new Error("Report not found");
          reportDoc.messages = Array.isArray(reportDoc.messages) ? reportDoc.messages : [];

          const idx = reportDoc.messages.findIndex((m: any) => String(m?.id) === messageId);
          if (idx < 0) throw new Error("Message not found");
          const msg = reportDoc.messages[idx];

          if (msg?.textFile) {
            try {
              await fs.unlink(path.join(inboxDir, String(msg.textFile)));
            } catch {
              // ignore
            }
          }
          if (msg?.mediaFile) {
            try {
              await fs.unlink(path.join(inboxDir, String(msg.mediaFile)));
            } catch {
              // ignore
            }
          }

          reportDoc.messages.splice(idx, 1);
          reportDoc.subject = await inferSubjectFromDoc(reportDoc, inboxDir);
          await fs.writeFile(reportPath, JSON.stringify(reportDoc, null, 2), "utf8");

          const existingIndex = (await readJsonSafe(indexPath)) as any;
          const index: any[] = Array.isArray(existingIndex) ? existingIndex : [];
          const hit = index.find((x) => x?.id === reportId);
          if (hit) hit.subject = String(reportDoc.subject || DEFAULT_SUBJECT);
          await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf8");

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (e: any) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: e?.message || "Bad request" }));
        }
      });

      server.middlewares.use("/api/report-box/submit", async (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
          return;
        }

        try {
          const body = (await parseJsonBody(req)) as {
            reportId?: string;
            factoryId?: string;
            kind: "text" | "voice" | "photo";
            text?: string;
            dataUrl?: string;
            mime?: string;
            durationSec?: number;
            at?: string;
          };

          const inboxDir = path.resolve(__dirname, "public/report-box/inbox");
          await fs.mkdir(inboxDir, { recursive: true });

          const indexPath = path.join(inboxDir, "index.json");
          let index: any[] = [];
          try {
            const existing = await fs.readFile(indexPath, "utf8");
            const parsed = JSON.parse(existing);
            if (Array.isArray(parsed)) index = parsed;
          } catch {
            // ignore
          }

          const createdAt = new Date().toISOString();
          const reportId = body.reportId
            ? String(body.reportId)
            : `rpt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          const msgId = `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          const at = body.at ? String(body.at) : createdAt;

          const reportFile = `${reportId}.json`;
          const reportPath = path.join(inboxDir, reportFile);

          let reportDoc: any = null;
          try {
            const existingReport = await fs.readFile(reportPath, "utf8");
            reportDoc = JSON.parse(existingReport);
          } catch {
            reportDoc = null;
          }

          if (!reportDoc || typeof reportDoc !== "object") {
            reportDoc = {
              id: reportId,
              createdAt,
              factoryId: body.factoryId,
              subject: DEFAULT_SUBJECT,
              messages: [],
            };
          }

          let textFile: string | undefined;
          let mediaFile: string | undefined;

          if (body.kind === "text") {
            textFile = `${reportId}__${msgId}.txt`;
            await fs.writeFile(
              path.join(inboxDir, textFile),
              String(body.text || ""),
              "utf8",
            );
          } else {
            const dataUrl = String(body.dataUrl || "");
            const comma = dataUrl.indexOf(",");
            const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
            const buf = Buffer.from(b64, "base64");
            const ext = body.kind === "photo" ? "jpg" : "webm";
            mediaFile = `${reportId}__${msgId}.${ext}`;
            await fs.writeFile(path.join(inboxDir, mediaFile), buf);
          }

          const inferredSubject =
            body.kind === "text"
              ? String(body.text || "").trim().slice(0, 80) || DEFAULT_SUBJECT
              : body.kind === "voice"
                ? VOICE_SUBJECT
                : PHOTO_SUBJECT;
          reportDoc.subject =
            reportDoc.subject && reportDoc.subject !== DEFAULT_SUBJECT
              ? reportDoc.subject
              : inferredSubject;
          reportDoc.factoryId = reportDoc.factoryId || body.factoryId;
          reportDoc.messages = Array.isArray(reportDoc.messages) ? reportDoc.messages : [];
          reportDoc.messages.push({
            id: msgId,
            at,
            kind: body.kind,
            durationSec: body.durationSec,
            textFile,
            mediaFile,
          });

          await fs.writeFile(reportPath, JSON.stringify(reportDoc, null, 2), "utf8");

          // Upsert index item (one per conversation/report)
          const existingItem = index.find((x) => x?.id === reportId);
          index = index.filter((x) => x?.id !== reportId);
          const item = {
            id: reportId,
            createdAt: reportDoc.createdAt || createdAt,
            factoryId: reportDoc.factoryId,
            subject: reportDoc.subject,
            reportFile,
            flagged: Boolean(existingItem?.flagged),
            status: existingItem?.status || "new",
            assignedTo: existingItem?.assignedTo,
          };
          index.unshift(item);
          await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf8");

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, reportId, messageId: msgId }));
        } catch (e: any) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: e?.message || "Bad request" }));
        }
      });
    },
  };
}

const useHttps =
  process.env.VITE_HTTPS === "1" || process.env.VITE_HTTPS === "true";

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    ...(useHttps ? [basicSsl()] : []),
    reportBoxInboxPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
  server: {
    https: useHttps,
    host: true,
    allowedHosts: ["molecular-samiyah-unowned.ngrok-free.dev"],
  },
});
