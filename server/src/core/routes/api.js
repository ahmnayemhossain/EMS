import { Router } from "express";

import { authRouter } from "./auth.js";
import { systemRouter } from "./system.js";
import { referenceRouter } from "./reference.js";
import { utilitiesRouter } from "../../features/routes/utilities.js";
import { chemicalsRouter } from "../../features/routes/chemicals.js";
import { sdsRouter } from "../../features/routes/sds.js";
import { reportsRouter } from "../../features/routes/reports.js";
import { reportBoxRouter } from "../../features/routes/report-box.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/system", systemRouter);
apiRouter.use("/ref", referenceRouter);
apiRouter.use("/utilities", utilitiesRouter);
apiRouter.use("/chemicals", chemicalsRouter);
apiRouter.use("/sds", sdsRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/report-box", reportBoxRouter);
