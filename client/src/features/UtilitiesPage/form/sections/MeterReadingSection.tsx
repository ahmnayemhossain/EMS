import { Input } from "@/core/app/components/ui/input";
import { utilityTypeFieldConfig } from "@/features/UtilitiesPage/constants";
import { FieldError, FieldLabel, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import type { UtilityFormErrors, UtilityFormProps } from "@/features/UtilitiesPage/form/types";

export function MeterReadingSection({ props, errors }: { props: UtilityFormProps; errors: UtilityFormErrors }) {
  const config = utilityTypeFieldConfig[props.type];
  const readingEnabled = config.allowMeterReading;
  const value = readingEnabled ? (typeof props.consumption === "number" ? String(props.consumption) : "") : props.consumptionInput;

  return (
    <FormSection title="Meter Reading">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5"><FieldLabel required={readingEnabled}>Previous Reading</FieldLabel><Input type="number" min={0} value={props.previousReading} onChange={(event) => props.onPreviousReadingChange(event.target.value)} placeholder="0" disabled={!readingEnabled} /><FieldError>{errors.previousReading}</FieldError></div>
        <div className="grid gap-1.5"><FieldLabel required={readingEnabled}>Current Reading</FieldLabel><Input type="number" min={0} value={props.currentReading} onChange={(event) => props.onCurrentReadingChange(event.target.value)} placeholder="0" disabled={!readingEnabled} /><FieldError>{errors.currentReading}</FieldError></div>
        <div className="grid gap-1.5 sm:col-span-2"><FieldLabel required={!readingEnabled}>{config.manualValueLabel}</FieldLabel><Input type="number" min={0} value={value} onChange={(event) => props.onConsumptionInputChange(event.target.value)} placeholder="0" disabled={readingEnabled} /><FieldError>{errors.consumption}</FieldError></div>
      </div>
    </FormSection>
  );
}
