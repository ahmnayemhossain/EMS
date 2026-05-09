import { Alert, AlertDescription, AlertTitle } from "@/core/app/components/ui/alert";
import { SelectFilter } from "@/core/components/SelectFilter";
import { utilityTypeFieldConfig, utilityTypes } from "@/features/UtilitiesPage/constants";
import { DatePickerField } from "@/features/UtilitiesPage/form/date-picker-field";
import { FieldError, FieldLabel, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import type { UtilityFormErrors, UtilityFormProps } from "@/features/UtilitiesPage/form/types";
import { formatUtilityType } from "@/core/utils/format";
import { AlertTriangle } from "lucide-react";

export function BasicInfoSection({ props, errors }: { props: UtilityFormProps; errors: UtilityFormErrors }) {
  const config = utilityTypeFieldConfig[props.type];
  const companyName = props.companies.find((company) => company.id === props.companyId)?.name ?? "No company assigned";
  const hasMeterOptions = props.meterOptions.length > 0;
  const selectedSourceName =
    props.sourceOptions.find((item) => item.id === props.sourceId)?.name ?? "Auto from meter";
  const selectedUnit = props.unit || "Auto from meter";

  return (
    <FormSection title="Basic Info">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid min-w-0 gap-1.5"><FieldLabel required>Company</FieldLabel><div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">{companyName}</div></div>
        <div className="grid min-w-0 gap-1.5"><FieldLabel required>Utility Type</FieldLabel><SelectFilter value={props.type} onChange={(value) => props.onTypeChange(value as typeof props.type)} placeholder="Utility type" items={utilityTypes.map((type) => ({ value: type, label: formatUtilityType(type) }))} invalid={Boolean(props.showValidation && errors.type)} /><FieldError /></div>
        <div className="grid min-w-0 gap-1.5 md:col-span-2">
          <FieldLabel required>Meter</FieldLabel>
          <SelectFilter
            value={props.meterId}
            onChange={props.onMeterIdChange}
            placeholder={hasMeterOptions ? "Select meter" : "No meters configured"}
            items={props.meterOptions.map((m) => ({
              value: m.id,
              label: m.code ? `${m.name} (${m.code})` : m.name,
            }))}
            disabled={!hasMeterOptions}
            invalid={Boolean(props.showValidation && errors.meterName)}
          />
          <FieldError />
        </div>
        <div className="grid min-w-0 gap-1.5"><FieldLabel>Source</FieldLabel><div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">{selectedSourceName}</div></div>
        <div className="grid min-w-0 gap-1.5"><FieldLabel>UOM</FieldLabel><div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">{selectedUnit}</div></div>
        <div className="grid min-w-0 gap-1.5"><FieldLabel required>Period Start</FieldLabel><DatePickerField label="Period start" value={props.periodStart} onChange={(value) => { props.onPeriodStartChange(value); if (value && props.periodEnd && value > props.periodEnd) props.onPeriodEndChange(value); }} invalid={Boolean(props.showValidation && errors.periodStart)} /><FieldError /></div>
        <div className="grid min-w-0 gap-1.5"><FieldLabel required>Period End</FieldLabel><DatePickerField label="Period end" value={props.periodEnd} onChange={(value) => { props.onPeriodEndChange(value); if (value && props.periodStart && value < props.periodStart) props.onPeriodStartChange(value); }} invalid={Boolean(props.showValidation && errors.periodEnd)} /><FieldError /></div>
        {props.coverageWarning ? (
          <div className="md:col-span-2">
            <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100">
              <AlertTriangle className="size-4" />
              <AlertTitle>Coverage warning</AlertTitle>
              <AlertDescription>{props.coverageWarning}</AlertDescription>
            </Alert>
          </div>
        ) : null}
      </div>
    </FormSection>
  );
}
