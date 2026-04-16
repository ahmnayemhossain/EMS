import { Router } from "express";

import { createCrudRouter } from "../shared/crud-router.js";
import { store } from "../shared/store.js";

export const referenceRouter = Router();

// Reference data used across operations & settings.
for (const key of [
  "factories",
  "departments",
  "designations",
  "uoms",
  "suppliers",
  "complaintBoxSettings",
  "emailSettings",
  "thresholds",
  "approvals",
]) {
  referenceRouter.use(
    `/${key}`,
    createCrudRouter({
      list: () => store.getAll(key),
      get: (id) => store.getById(key, id),
      create: (input) => store.create(key, input),
      update: (id, input) => store.update(key, id, input),
      remove: (id) => store.remove(key, id),
    }),
  );
}

