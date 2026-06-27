import { Input } from "@/components/ui/primitives/input";
import { utilityTypeFieldConfig } from "@/features/operations/utilities/config/constants";
import { FieldError, FieldLabel, FormSection } from "@/features/operations/utilities/form/components/form-ui";
import type { UtilityFormErrors, UtilityFormProps } from "@/features/operations/utilities/form/config/types";

export function MeterReadingSection({ props, errors }: { props: UtilityFormProps; errors: UtilityFormErrors }) {
  const config = utilityTypeFieldConfig[props.type];
  const selectedSourceName = props.sourceOptions.find((source) => source.id === props.sourceId)?.name ?? "";
  const generatorMode = props.type === "electricity" && selectedSourceName.toLowerCase() === "generator";
  const readingEnabled = config.allowMeterReading;
  const computedKwh = typeof props.consumption === "number" ? String(props.consumption) : "";
  const value = readingEnabled ? computedKwh : props.consumptionInput;

  return (
    <FormSection title="Meter Reading">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid min-w-0 gap-1.5">
          <FieldLabel required={readingEnabled}>Previous Reading</FieldLabel>
          <Input
            type="number"
            min={0}
            value={props.previousReading}
            onChange={(event) => props.onPreviousReadingChange(event.target.value)}
            placeholder="0"
            disabled={!readingEnabled}
            aria-invalid={props.showValidation && errors.previousReading ? true : undefined}
          />
          <FieldError />
        </div>
        <div className="grid min-w-0 gap-1.5">
          <FieldLabel required={readingEnabled}>Current Reading</FieldLabel>
          <Input
            type="number"
            min={0}
            value={props.currentReading}
            onChange={(event) => props.onCurrentReadingChange(event.target.value)}
            placeholder="0"
            disabled={!readingEnabled}
            aria-invalid={props.showValidation && errors.currentReading ? true : undefined}
          />
          <FieldError />
        </div>

        {generatorMode ? (
          <div className="grid min-w-0 gap-1.5 md:col-span-2">
            <FieldLabel required>Diesel consumption (L)</FieldLabel>
            <Input
              type="number"
              step="0.01"
              value={props.dieselLitersInput}
              onChange={(event) => props.onDieselLitersInputChange(event.target.value)}
              placeholder="0"
              aria-invalid={props.showValidation && errors.consumption ? true : undefined}
            />
            <FieldError />
          </div>
        ) : (
          <div className="grid min-w-0 gap-1.5 md:col-span-2">
            <FieldLabel required={!readingEnabled}>{config.manualValueLabel}</FieldLabel>
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(event) => props.onConsumptionInputChange(event.target.value)}
              placeholder="0"
              disabled={readingEnabled}
              aria-invalid={props.showValidation && errors.consumption ? true : undefined}
            />
            <FieldError />
          </div>
        )}
      </div>
    </FormSection>
  );
}

