import { listActiveReportDefinitions, runReportByKey } from "../../modules/reports/run-report.js";

export async function listActiveReportDefinitionsHandler(req, res, next) {
  try {
    const defs = await listActiveReportDefinitions();
    res.json(defs);
  } catch (error) {
    next(error);
  }
}

export async function runReportHandler(req, res, next) {
  try {
    const rows = await runReportByKey({
      req,
      key: req.params.key,
      variables: req.body || {},
    });
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

