import { ReadOnlyField, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import type { UtilityFormProps } from "@/features/UtilitiesPage/form/types";
import { formatNumber } from "@/core/utils/format";

export function CalculatedResultSection({ props }: { props: UtilityFormProps }) {
  return (
    <FormSection title="Result">
      <div className="grid gap-3">
        <ReadOnlyField label="Consumption" value={typeof props.consumption === "number" ? `${formatNumber(props.consumption)} ${props.unit}` : "--"} />
      </div>
    </FormSection>
  );
}
