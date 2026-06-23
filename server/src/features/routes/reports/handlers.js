import { convertRowsToCsv, listActiveReportDefinitions, runReportByKey } from "../../modules/reports/run-report.js";

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

export async function exportReportHandler(req, res, next) {
  try {
    const rows = await runReportByKey({
      req,
      key: req.params.key,
      variables: req.body || {},
      maxRows: Number(process.env.REPORT_EXPORT_MAX_ROWS || 20000),
    });

    const csv = convertRowsToCsv(rows);
    const filename = `${String(req.params.key || "report")}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}
