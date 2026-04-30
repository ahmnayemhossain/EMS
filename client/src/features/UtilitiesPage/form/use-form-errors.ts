import { utilityTypeFieldConfig } from "@/features/UtilitiesPage/constants";
import type { UtilityFormErrors, UtilityFormProps } from "@/features/UtilitiesPage/form/types";

export function useUtilityFormErrors(props: UtilityFormProps): UtilityFormErrors {
  const config = utilityTypeFieldConfig[props.type];
  const sourceEnabled = config.allowSource && props.sourceOptions.length > 0;
  const readingEnabled = config.allowMeterReading;
  const previousNumber = props.previousReading.trim() === "" ? undefined : Number(props.previousReading);
  const currentNumber = props.currentReading.trim() === "" ? undefined : Number(props.currentReading);
  const inputNumber = props.consumptionInput.trim() === "" ? undefined : Number(props.consumptionInput);

  return {
    company: !props.companyId ? "Company is required." : "",
    type: !props.type ? "Utility type is required." : "",
    unit: !props.unit ? "UOM is required." : "",
    source: sourceEnabled && !props.sourceId ? "Source is required." : "",
    periodStart: !props.periodStart ? "Period start is required." : "",
    periodEnd: !props.periodEnd ? "Period end is required." : "",
    meterName: !props.meterName.trim() ? "Meter name is required." : "",
    previousReading: !readingEnabled ? "" : !props.previousReading.trim() ? "Previous reading is required."
      : typeof previousNumber !== "number" || Number.isNaN(previousNumber) || previousNumber < 0 ? "Previous reading must be >= 0." : "",
    currentReading: !readingEnabled ? "" : !props.currentReading.trim() ? "Current reading is required."
      : typeof currentNumber !== "number" || Number.isNaN(currentNumber) ? "Current reading is required."
      : typeof previousNumber === "number" && currentNumber < previousNumber ? "Current reading must be >= previous reading."
      : typeof props.consumption === "number" && props.consumption <= 0 ? "Consumption must be > 0." : "",
    consumption: readingEnabled ? "" : !props.consumptionInput.trim() ? `${config.manualValueLabel} is required.`
      : typeof inputNumber !== "number" || Number.isNaN(inputNumber) || inputNumber <= 0 ? `${config.manualValueLabel} must be > 0.` : "",
  };
}
