import { Router } from "express";

import { authRouter } from "./auth.js";
import { systemRouter } from "./system.js";
import { referenceRouter } from "./reference.js";
import { utilitiesRouter } from "./utilities.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/system", systemRouter);
apiRouter.use("/ref", referenceRouter);
apiRouter.use("/utilities", utilitiesRouter);
