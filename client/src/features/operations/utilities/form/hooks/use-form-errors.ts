import { utilityTypeFieldConfig } from "@/features/operations/utilities/config/constants";
import type {
  UtilityFormErrors,
  UtilityFormProps,
} from "@/features/operations/utilities/form/config/types";

export function useUtilityFormErrors(props: UtilityFormProps): UtilityFormErrors {
  const config = utilityTypeFieldConfig[props.type];
  const sourceEnabled = config.allowSource && props.sourceOptions.length > 0;
  const selectedSourceName =
    props.sourceOptions.find((source) => source.id === props.sourceId)?.name ?? "";
  const generatorMode =
    props.type === "electricity" && selectedSourceName.toLowerCase() === "generator";
  const readingEnabled = config.allowMeterReading;
  const previousNumber =
    props.previousReading.trim() === "" ? undefined : Number(props.previousReading);
  const currentNumber =
    props.currentReading.trim() === "" ? undefined : Number(props.currentReading);
  const inputNumber =
    props.consumptionInput.trim() === "" ? undefined : Number(props.consumptionInput);
  const dieselNumber =
    props.dieselLitersInput.trim() === "" ? undefined : Number(props.dieselLitersInput);

  return {
    company: !props.companyId ? "Company is required." : "",
    type: !props.type ? "Utility type is required." : "",
    unit: !props.unit ? "UOM is required." : "",
    source: sourceEnabled && !props.sourceId ? "Source is required." : "",
    periodStart: !props.periodStart ? "Period start is required." : "",
    periodEnd:
      !props.periodEnd
        ? "Period end is required."
        : props.periodStart &&
            props.periodEnd &&
            props.periodStart.slice(0, 7) !== props.periodEnd.slice(0, 7)
          ? "One utility entry cannot span more than one month."
          : "",
    coverage: "",
    meterName:
      !props.meterOptions.length
        ? "No configured meter found for this utility type. Add meter from settings first."
        : !props.meterId
          ? "Meter selection is required."
          : !props.meterName.trim()
            ? "Meter name is required."
            : "",
    previousReading:
      !readingEnabled
        ? ""
        : !props.previousReading.trim()
          ? "Previous reading is required."
          : typeof previousNumber !== "number" ||
              Number.isNaN(previousNumber) ||
              previousNumber < 0
            ? "Previous reading must be >= 0."
            : "",
    currentReading:
      !readingEnabled
        ? ""
        : !props.currentReading.trim()
          ? "Current reading is required."
          : typeof currentNumber !== "number" || Number.isNaN(currentNumber)
            ? "Current reading is required."
            : typeof previousNumber === "number" && currentNumber < previousNumber
              ? "Current reading must be >= previous reading."
              : typeof props.consumption === "number" && props.consumption <= 0
                ? "Consumption must be > 0."
                : "",
    consumption: generatorMode
      ? !props.dieselLitersInput.trim()
        ? "Diesel consumption is required."
        : typeof dieselNumber !== "number" ||
            Number.isNaN(dieselNumber)
          ? "Diesel consumption must be a valid number."
          : ""
      : readingEnabled
        ? ""
        : !props.consumptionInput.trim()
          ? `${config.manualValueLabel} is required.`
          : typeof inputNumber !== "number" ||
              Number.isNaN(inputNumber) ||
              inputNumber <= 0
            ? `${config.manualValueLabel} must be > 0.`
            : "",
  };
}
