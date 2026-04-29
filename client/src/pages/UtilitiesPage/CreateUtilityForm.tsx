import { BasicInfoSection } from "@/pages/UtilitiesPage/form/sections/BasicInfoSection";
import { CalculatedResultSection } from "@/pages/UtilitiesPage/form/sections/CalculatedResultSection";
import { MeterReadingSection } from "@/pages/UtilitiesPage/form/sections/MeterReadingSection";
import { RemarksAttachmentSection } from "@/pages/UtilitiesPage/form/sections/RemarksAttachmentSection";
import type { UtilityFormProps } from "@/pages/UtilitiesPage/form/types";
import { useUtilityFormErrors } from "@/pages/UtilitiesPage/form/use-form-errors";

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
