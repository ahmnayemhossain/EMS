import { Router } from "express";

export function createCrudRouter(handlers) {
  const r = Router();

  r.get("/", async (_req, res) => {
    res.json(await handlers.list());
  });

  r.get("/:id", async (req, res) => {
    const row = await handlers.get(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  });

  r.post("/", async (req, res) => {
    const created = await handlers.create(req.body || {});
    res.status(201).json(created);
  });

  r.put("/:id", async (req, res) => {
    const updated = await handlers.update(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json(updated);
  });

  r.delete("/:id", async (req, res) => {
    const ok = await handlers.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  });

  return r;
}

