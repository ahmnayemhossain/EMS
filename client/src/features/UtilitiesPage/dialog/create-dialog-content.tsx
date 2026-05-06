import type { CompanyOption } from "@/core/app/state/company";
import { UtilityFormFields } from "@/features/UtilitiesPage/dialog/UtilityFormFields";
import type { UtilityDialogFormState } from "@/features/UtilitiesPage/dialog/form-state";
import type { UtilityUsageStatus } from "@/features/UtilitiesPage/baseline-settings";
import type { UtilityMeterOption, UtilitySourceOption, UtilityUomOption } from "@/core/types/ems";

export function CreateDialogContent(props: {
  state: UtilityDialogFormState;
  companies: CompanyOption[];
  meterOptions: UtilityMeterOption[];
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  consumption?: number;
  status?: UtilityUsageStatus;
  attachmentError?: string;
  updateState: <K extends keyof UtilityDialogFormState>(key: K, value: UtilityDialogFormState[K]) => void;
}) {
  return (
    <UtilityFormFields
      state={props.state}
      companies={props.companies}
      meterOptions={props.meterOptions}
      uomOptions={props.uomOptions}
      sourceOptions={props.sourceOptions}
      consumption={props.consumption}
      status={props.status}
      attachmentError={props.attachmentError}
      updateState={props.updateState}
    />
  );
}
