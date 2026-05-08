import { Input } from "@/core/app/components/ui/input";
import { utilityTypeFieldConfig } from "@/features/UtilitiesPage/constants";
import { FieldError, FieldLabel, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import type { UtilityFormErrors, UtilityFormProps } from "@/features/UtilitiesPage/form/types";

export function MeterReadingSection({ props, errors }: { props: UtilityFormProps; errors: UtilityFormErrors }) {
  const config = utilityTypeFieldConfig[props.type];
  const selectedSourceName = props.sourceOptions.find((source) => source.id === props.sourceId)?.name ?? "";
  const generatorMode = props.type === "electricity" && selectedSourceName.toLowerCase() === "generator";
  const generatorReadingLocked = generatorMode && props.dieselLitersInput.trim() !== "";
  const generatorDieselLocked =
    generatorMode && (props.previousReading.trim() !== "" || props.currentReading.trim() !== "");
  const readingEnabled = config.allowMeterReading && !generatorReadingLocked;
  const computedKwh = typeof props.consumption === "number" ? String(props.consumption) : "";
  const value = readingEnabled ? computedKwh : props.consumptionInput;

  return (
    <FormSection title="Meter Reading">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
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
        <div className="grid gap-1.5">
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
          <div className="grid gap-1.5 sm:col-span-2">
            <FieldLabel required={!props.previousReading.trim() && !props.currentReading.trim()}>
              Diesel consumption (L)
            </FieldLabel>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={props.dieselLitersInput}
              onChange={(event) => props.onDieselLitersInputChange(event.target.value)}
              placeholder="0"
              disabled={generatorDieselLocked}
              aria-invalid={props.showValidation && errors.consumption ? true : undefined}
            />
            <div className="text-muted-foreground text-xs">
              Generator source e meter reading ba diesel consumption {"\u2014"} jekono ekta dite parbe. Ekta dile arekta lock hobe.
            </div>
            <div className="text-muted-foreground text-xs">
              kWh = liters {"\u00d7"} {typeof props.generatorDieselKwhPerLiter === "number" ? props.generatorDieselKwhPerLiter : "--"} (set in Settings {"\u2192"} Operations {"\u2192"} Utilities rules)
            </div>
            <FieldError />
          </div>
        ) : (
          <div className="grid gap-1.5 sm:col-span-2">
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
