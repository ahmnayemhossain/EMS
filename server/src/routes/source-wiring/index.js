import { assertSourceWiringDeleteAllowed } from "../../shared/delete-guards.js";
import { createWiringRouter } from "../wiring-route/index.js";

export const sourceWiringRouter = createWiringRouter({
  tableName: "source_wiring",
  sourceTable: "sources",
  sourceColumn: "source_id",
  sourceIdField: "source_id",
  sourceIdKey: "sourceId",
  sourceNameKey: "sourceName",
  sourceLabel: "Source",
  sourceOptionsKey: "sourceOptions",
  permissionKey: "settings:source-wiring",
  assertDeleteAllowed: assertSourceWiringDeleteAllowed,
});
