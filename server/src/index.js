import "./env.js";
import express from "express";
import cors from "cors";

import { apiRouter } from "./routes/api.js";

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
app.use(express.json({ limit: "2mb" }));

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
