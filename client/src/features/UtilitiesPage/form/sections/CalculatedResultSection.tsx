import { StatusBadge } from "@/core/components/StatusBadge";
import { ReadOnlyField, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import { statusTone } from "@/features/UtilitiesPage/form/status-tone";
import type { UtilityFormProps } from "@/features/UtilitiesPage/form/types";
import { formatNumber } from "@/core/utils/format";

export function CalculatedResultSection({ props }: { props: UtilityFormProps }) {
  return (
    <FormSection title="Calculated Result">
      <div className="grid gap-3 sm:grid-cols-2">
        <ReadOnlyField label="Consumption" value={typeof props.consumption === "number" ? `${formatNumber(props.consumption)} ${props.unit}` : "--"} />
        <ReadOnlyField label="Status" value={props.status ? <StatusBadge tone={statusTone(props.status)}>{props.status}</StatusBadge> : "--"} />
      </div>
    </FormSection>
  );
}
