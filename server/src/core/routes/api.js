import { Router } from "express";

import { authRouter } from "./auth.js";
import { systemRouter } from "./system.js";
import { utilitiesRouter } from "../../features/routes/utilities.js";
import { chemicalsRouter } from "../../features/routes/chemicals.js";
import { capaRouter } from "../../features/routes/capa.js";
import { sdsRouter } from "../../features/routes/sds.js";
import { wasteRouter } from "../../features/routes/waste.js";
import { wastewaterRouter } from "../../features/routes/wastewater.js";
import { reportsRouter } from "../../features/routes/reports.js";
import { auditsRouter } from "../../features/routes/audits.js";
import { documentsRouter } from "../../features/routes/documents.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/system", systemRouter);
apiRouter.use("/utilities", utilitiesRouter);
apiRouter.use("/chemicals", chemicalsRouter);
apiRouter.use("/capa", capaRouter);
apiRouter.use("/sds", sdsRouter);
apiRouter.use("/waste", wasteRouter);
apiRouter.use("/wastewater", wastewaterRouter);
apiRouter.use("/audits", auditsRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/documents", documentsRouter);
