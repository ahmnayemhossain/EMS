import { BasicInfoSection } from "@/features/operations/utilities/form/sections/BasicInfoSection";
import { CalculatedResultSection } from "@/features/operations/utilities/form/sections/CalculatedResultSection";
import { MeterReadingSection } from "@/features/operations/utilities/form/sections/MeterReadingSection";
import { RemarksAttachmentSection } from "@/features/operations/utilities/form/sections/RemarksAttachmentSection";
import type { UtilityFormProps } from "@/features/operations/utilities/form/config/types";
import { useUtilityFormErrors } from "@/features/operations/utilities/form/hooks/use-form-errors";

export function CreateUtilityForm(props: UtilityFormProps) {
  const errors = useUtilityFormErrors(props);

  return (
    <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
      <div className="grid gap-4">
        <BasicInfoSection props={props} errors={errors} />
        <MeterReadingSection props={props} errors={errors} />
      </div>
      <div className="grid content-start gap-4">
        <CalculatedResultSection props={props} />
        <RemarksAttachmentSection props={props} />
      </div>
    </div>
  );
}
