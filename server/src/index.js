import "./env.js";
import express from "express";
import cors from "cors";

import { apiRouter } from "./core/routes/api.js";
import { ensureCoreSchema } from "./core/shared/schema.js";
import { ensureDirectory, getCdnPublicBase, getCdnRoot } from "./core/shared/storage.js";

const app = express();

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "127.0.0.1";
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
await ensureDirectory(getCdnRoot());
await ensureCoreSchema();
app.use(getCdnPublicBase(), express.static(getCdnRoot()));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    name: "EMS Platform API",
    time: new Date().toISOString(),
  });
});

app.use("/api", apiRouter);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err?.status || 400).json({ error: err?.message || "bad_request" });
});

const server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[ems-api] listening on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  // eslint-disable-next-line no-console
  console.error(`[ems-api] failed to listen on http://${HOST}:${PORT}`, error);
  process.exit(1);
});
