import {
  buildSourceMasterWiringOptions,
  renderMasterWiringModule,
} from "@/features/admin/settings/modules/master-wiring/build-master-wiring-module";

export function SourcesModule() {
  return renderMasterWiringModule(buildSourceMasterWiringOptions());
}
