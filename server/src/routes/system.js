import { Router } from "express";

import { createCrudRouter } from "../shared/crud-router.js";
import { store } from "../shared/store.js";

export const systemRouter = Router();

systemRouter.use(
  "/employees",
  createCrudRouter({
    list: () => store.getAll("employees"),
    get: (id) => store.getById("employees", id),
    create: (input) => store.create("employees", input),
    update: (id, input) => store.update("employees", id, input),
    remove: (id) => store.remove("employees", id),
  }),
);

systemRouter.use(
  "/users",
  createCrudRouter({
    list: () => store.getAll("users"),
    get: (id) => store.getById("users", id),
    create: (input) => store.create("users", input),
    update: (id, input) => store.update("users", id, input),
    remove: (id) => store.remove("users", id),
  }),
);

systemRouter.use(
  "/roles",
  createCrudRouter({
    list: () => store.getAll("roles"),
    get: (id) => store.getById("roles", id),
    create: (input) => store.create("roles", input),
    update: (id, input) => store.update("roles", id, input),
    remove: (id) => store.remove("roles", id),
  }),
);

