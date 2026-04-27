import { Router } from "express";

import { systemRouter } from "./system.js";
import { referenceRouter } from "./reference.js";
import { utilitiesRouter } from "./utilities.js";

export const apiRouter = Router();

apiRouter.use("/system", systemRouter);
apiRouter.use("/ref", referenceRouter);
apiRouter.use("/utilities", utilitiesRouter);
