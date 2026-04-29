import type { UtilityDialogFormState } from "@/pages/UtilitiesPage/dialog/form-state";

export function getCreateDialogErrors(input: {
  state: UtilityDialogFormState;
  attachmentError: string;
  consumption?: number;
  config: { allowSource: boolean; allowMeterReading: boolean; meterLabel: string; manualValueLabel: string };
  filteredSourceOptions: Array<{ id: string }>;
  previousReading?: number;
  currentReading?: number;
  manualConsumption?: number;
}) {
  return [
    !input.state.companyId ? "Company is required." : "",
    !input.state.type ? "Utility type is required." : "",
    !input.state.unit ? "UOM is required." : "",
    input.config.allowSource && input.filteredSourceOptions.length > 0 && !input.state.sourceId ? "Source is required." : "",
    !input.state.periodStart ? "Period start is required." : "",
    !input.state.periodEnd ? "Period end is required." : "",
    !input.state.meterName.trim() ? `${input.config.meterLabel} is required.` : "",
    input.attachmentError,
    input.config.allowMeterReading && (typeof input.previousReading !== "number" || Number.isNaN(input.previousReading) || input.previousReading < 0) ? "Previous reading must be >= 0." : "",
    input.config.allowMeterReading && (typeof input.currentReading !== "number" || Number.isNaN(input.currentReading)) ? "Current reading is required." : "",
    input.config.allowMeterReading && typeof input.currentReading === "number" && typeof input.previousReading === "number" && input.currentReading < input.previousReading ? "Current reading must be >= previous reading." : "",
    !input.config.allowMeterReading && (typeof input.manualConsumption !== "number" || Number.isNaN(input.manualConsumption) || input.manualConsumption <= 0) ? `${input.config.manualValueLabel} must be > 0.` : "",
    typeof input.consumption === "number" && input.consumption <= 0 ? "Consumption must be > 0." : "",
  ].filter(Boolean);
}
