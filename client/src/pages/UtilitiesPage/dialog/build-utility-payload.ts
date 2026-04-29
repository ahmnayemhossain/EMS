import type { UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import type { UtilityDialogFormState } from "@/pages/UtilitiesPage/dialog/form-state";

export function buildUtilityPayload(input: {
  state: UtilityDialogFormState;
  config: { allowSource: boolean; allowMeterReading: boolean };
  filteredSourceOptions: Array<{ id: string; name: string }>;
  previousReading?: number;
  currentReading?: number;
  consumption?: number;
  status: UtilityUsagePayload["status"];
}) {
  if (typeof input.consumption !== "number") return undefined;

  const payload: UtilityUsagePayload = {
    companyId: input.state.companyId,
    utilityType: input.state.type,
    meterName: input.state.meterName.trim(),
    sourceId: input.config.allowSource ? input.state.sourceId || undefined : undefined,
    sourceName: input.filteredSourceOptions.find((item) => item.id === input.state.sourceId)?.name,
    periodStart: input.state.periodStart,
    periodEnd: input.state.periodEnd,
    previousReading: input.config.allowMeterReading ? input.previousReading : undefined,
    currentReading: input.config.allowMeterReading ? input.currentReading : undefined,
    consumption: input.consumption,
    unit: input.state.unit,
    status: input.status,
    remarks: input.state.remarks.trim() || undefined,
    attachment: input.state.attachment,
  };

  return payload;
}
