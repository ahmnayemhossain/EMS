import type { UtilityUsagePayload } from "@/features/UtilitiesPage/baseline-settings";
import type { UtilityDialogFormState } from "@/features/UtilitiesPage/dialog/form-state";

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
  const sourceName = input.filteredSourceOptions.find((item) => item.id === input.state.sourceId)?.name;
  const generatorMode = input.state.type === "electricity" && String(sourceName || "").toLowerCase() === "generator";
  const dieselLiters = generatorMode && input.state.dieselLitersInput.trim() !== "" ? Number(input.state.dieselLitersInput) : undefined;

  const payload: UtilityUsagePayload = {
    companyId: input.state.companyId,
    utilityType: input.state.type,
    meterId: input.state.meterId !== "custom" ? input.state.meterId : undefined,
    meterName: input.state.meterName.trim(),
    sourceId: input.config.allowSource ? input.state.sourceId || undefined : undefined,
    sourceName,
    periodStart: input.state.periodStart,
    periodEnd: input.state.periodEnd,
    previousReading: input.config.allowMeterReading ? input.previousReading : undefined,
    currentReading: input.config.allowMeterReading ? input.currentReading : undefined,
    dieselLiters: typeof dieselLiters === "number" && Number.isFinite(dieselLiters) ? dieselLiters : undefined,
    consumption: input.consumption,
    unit: input.state.unit,
    status: input.status,
    remarks: input.state.remarks.trim() || undefined,
    attachment: input.state.attachment,
  };

  return payload;
}
