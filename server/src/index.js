import express from "express";
import cors from "cors";

import { apiRouter } from "./routes/api.js";

const app = express();

const PORT = Number(process.env.PORT || 4000);
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
    name: "Fortis Group EMS API",
    time: new Date().toISOString(),
  });
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[ems-api] listening on http://localhost:${PORT}`);
});

