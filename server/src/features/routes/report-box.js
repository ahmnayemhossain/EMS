import { Router } from "express";

import {
  deleteReportBoxMessageHandler,
  deleteReportBoxReportHandler,
  editReportBoxMessageHandler,
  submitReportBoxHandler,
} from "./report-box/handlers.js";

export const reportBoxRouter = Router();

reportBoxRouter.post("/submit", submitReportBoxHandler);
reportBoxRouter.post("/message/edit", editReportBoxMessageHandler);
reportBoxRouter.post("/message/delete", deleteReportBoxMessageHandler);
reportBoxRouter.post("/delete", deleteReportBoxReportHandler);
