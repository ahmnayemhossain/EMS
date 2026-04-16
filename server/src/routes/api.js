import { Router } from "express";

import { systemRouter } from "./system.js";
import { referenceRouter } from "./reference.js";

export const apiRouter = Router();

apiRouter.use("/system", systemRouter);
apiRouter.use("/ref", referenceRouter);

