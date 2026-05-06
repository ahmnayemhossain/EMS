import { Input } from "@/core/app/components/ui/input";
import { SelectFilter } from "@/core/components/SelectFilter";
import { utilityTypeFieldConfig, utilityTypes } from "@/features/UtilitiesPage/constants";
import { DatePickerField } from "@/features/UtilitiesPage/form/date-picker-field";
import { FieldError, FieldLabel, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import type { UtilityFormErrors, UtilityFormProps } from "@/features/UtilitiesPage/form/types";
import { formatUtilityType } from "@/core/utils/format";

export function BasicInfoSection({ props, errors }: { props: UtilityFormProps; errors: UtilityFormErrors }) {
  const config = utilityTypeFieldConfig[props.type];
  const sourceEnabled = config.allowSource && props.sourceOptions.length > 0;
  const companyName = props.companies.find((company) => company.id === props.companyId)?.name ?? "No company assigned";
  const isMeterLocked = props.meterId && props.meterId !== "custom";

  return (
    <FormSection title="Basic Info">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5"><FieldLabel required>Company</FieldLabel><div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">{companyName}</div><FieldError>{errors.company}</FieldError></div>
        <div className="grid gap-1.5"><FieldLabel required>Utility Type</FieldLabel><SelectFilter value={props.type} onChange={(value) => props.onTypeChange(value as typeof props.type)} placeholder="Utility type" items={utilityTypes.map((type) => ({ value: type, label: formatUtilityType(type) }))} /><FieldError>{errors.type}</FieldError></div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel>Meter</FieldLabel>
          <SelectFilter
            value={props.meterId}
            onChange={props.onMeterIdChange}
            placeholder={props.meterOptions.length ? "Select meter" : "No meters configured"}
            items={[
              { value: "custom", label: "Custom entry" },
              ...props.meterOptions.map((m) => ({
                value: m.id,
                label: m.code ? `${m.name} (${m.code})` : m.name,
              })),
            ]}
          />
        </div>
        <div className="grid gap-1.5"><FieldLabel required={sourceEnabled}>Source</FieldLabel><SelectFilter value={props.sourceId} onChange={props.onSourceChange} placeholder={props.sourceOptions.length ? "Select source" : "No source configured"} items={props.sourceOptions.map((item) => ({ value: item.id, label: item.name }))} disabled={!sourceEnabled || isMeterLocked} /><FieldError>{errors.source}</FieldError></div>
        <div className="grid gap-1.5"><FieldLabel required>UOM</FieldLabel><SelectFilter value={props.unit} onChange={props.onUnitChange} placeholder={props.uomOptions.length ? "Select UOM" : "No UOM configured"} items={props.uomOptions.map((item) => ({ value: item.name, label: item.name }))} disabled={isMeterLocked} /><FieldError>{errors.unit}</FieldError></div>
        <div className="grid gap-1.5"><FieldLabel required>Period Start</FieldLabel><DatePickerField label="Period start" value={props.periodStart} onChange={(value) => { props.onPeriodStartChange(value); if (value && props.periodEnd && value > props.periodEnd) props.onPeriodEndChange(value); }} /><FieldError>{errors.periodStart}</FieldError></div>
        <div className="grid gap-1.5"><FieldLabel required>Period End</FieldLabel><DatePickerField label="Period end" value={props.periodEnd} onChange={(value) => { props.onPeriodEndChange(value); if (value && props.periodStart && value < props.periodStart) props.onPeriodStartChange(value); }} /><FieldError>{errors.periodEnd}</FieldError></div>
        <div className="grid gap-1.5 sm:col-span-2"><FieldLabel required>{config.meterLabel}</FieldLabel><Input value={props.meterName} onChange={(event) => props.onMeterNameChange(event.target.value)} placeholder="e.g. Main incomer" disabled={isMeterLocked} /><FieldError>{errors.meterName}</FieldError></div>
      </div>
    </FormSection>
  );
}
