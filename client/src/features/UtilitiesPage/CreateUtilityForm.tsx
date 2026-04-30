import { BasicInfoSection } from "@/features/UtilitiesPage/form/sections/BasicInfoSection";
import { CalculatedResultSection } from "@/features/UtilitiesPage/form/sections/CalculatedResultSection";
import { MeterReadingSection } from "@/features/UtilitiesPage/form/sections/MeterReadingSection";
import { RemarksAttachmentSection } from "@/features/UtilitiesPage/form/sections/RemarksAttachmentSection";
import type { UtilityFormProps } from "@/features/UtilitiesPage/form/types";
import { useUtilityFormErrors } from "@/features/UtilitiesPage/form/use-form-errors";

export function CreateUtilityForm(props: UtilityFormProps) {
  const errors = useUtilityFormErrors(props);

  return (
    <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1">
      <BasicInfoSection props={props} errors={errors} />
      <MeterReadingSection props={props} errors={errors} />
      <CalculatedResultSection props={props} />
      <RemarksAttachmentSection props={props} />
    </div>
  );
}
