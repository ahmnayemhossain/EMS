import {
  buildUomMasterWiringOptions,
  renderMasterWiringModule,
} from "@/features/admin/settings/modules/master-wiring/build-master-wiring-module";

export function UomModule() {
  return renderMasterWiringModule(buildUomMasterWiringOptions());
}
