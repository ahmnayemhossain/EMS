import { assertUomWiringDeleteAllowed } from "../../shared/delete-guards.js";
import { createWiringRouter } from "../wiring-route/index.js";

export const uomWiringRouter = createWiringRouter({
  tableName: "uom_wiring",
  sourceTable: "uom",
  sourceColumn: "uom_id",
  sourceIdField: "uom_id",
  sourceIdKey: "uomId",
  sourceNameKey: "uomName",
  sourceLabel: "UOM",
  sourceOptionsKey: "uomOptions",
  permissionKey: "settings:uom-wiring",
  assertDeleteAllowed: assertUomWiringDeleteAllowed,
});
