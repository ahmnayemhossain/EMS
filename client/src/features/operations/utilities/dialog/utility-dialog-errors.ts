import type { UtilityDialogFormState } from "@/features/operations/utilities/dialog/form-state";

export function getCreateDialogErrors(input: {
  state: UtilityDialogFormState;
  attachmentError: string;
  consumption?: number;
  generatorMode?: boolean;
  config: { allowSource: boolean; allowMeterReading: boolean; meterLabel: string; manualValueLabel: string };
  filteredSourceOptions: Array<{ id: string }>;
  previousReading?: number;
  currentReading?: number;
  manualConsumption?: number;
}) {
  const generatorMode = input.generatorMode === true;
  const readingEnabled = input.config.allowMeterReading;

  return [
    !input.state.companyId ? "Company is required." : "",
    !input.state.type ? "Utility type is required." : "",
    !input.state.unit ? "UOM is required." : "",
    input.config.allowSource && input.filteredSourceOptions.length > 0 && !input.state.sourceId
      ? "Source is required."
      : "",
    !input.state.periodStart ? "Period start is required." : "",
    !input.state.periodEnd ? "Period end is required." : "",
    input.state.periodStart &&
    input.state.periodEnd &&
    input.state.periodStart.slice(0, 7) !== input.state.periodEnd.slice(0, 7)
      ? "One utility entry cannot span more than one month."
      : "",
    !input.state.meterId ? "Meter selection is required." : !input.state.meterName.trim() ? `${input.config.meterLabel} is required.` : "",
    input.attachmentError,
    readingEnabled &&
    (typeof input.previousReading !== "number" || Number.isNaN(input.previousReading) || input.previousReading < 0)
      ? "Previous reading must be >= 0."
      : "",
    readingEnabled && (typeof input.currentReading !== "number" || Number.isNaN(input.currentReading))
      ? "Current reading is required."
      : "",
    readingEnabled &&
    typeof input.currentReading === "number" &&
    typeof input.previousReading === "number" &&
    input.currentReading < input.previousReading
      ? "Current reading must be >= previous reading."
      : "",
    generatorMode
      ? typeof input.manualConsumption !== "number" ||
          Number.isNaN(input.manualConsumption) ||
          input.manualConsumption <= 0
        ? "Diesel consumption must be > 0."
        : ""
      : !readingEnabled &&
          (typeof input.manualConsumption !== "number" ||
            Number.isNaN(input.manualConsumption) ||
            input.manualConsumption <= 0)
        ? `${input.config.manualValueLabel} must be > 0.`
        : "",
    generatorMode &&
    (
      typeof input.previousReading !== "number" ||
      Number.isNaN(input.previousReading) ||
      typeof input.currentReading !== "number" ||
      Number.isNaN(input.currentReading)
    )
      ? "Generator output meter reading is required."
      : "",
    typeof input.consumption === "number" && input.consumption <= 0 ? "Consumption must be > 0." : "",
  ].filter(Boolean);
}
