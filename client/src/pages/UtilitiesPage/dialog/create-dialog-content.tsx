import type { CompanyOption } from "@/app/state/company";
import { UtilityFormFields } from "@/pages/UtilitiesPage/dialog/UtilityFormFields";
import type { UtilityDialogFormState } from "@/pages/UtilitiesPage/dialog/form-state";
import type { UtilityUsageStatus } from "@/pages/UtilitiesPage/baseline-settings";
import type { UtilitySourceOption, UtilityUomOption } from "@/types/ems";

export function CreateDialogContent(props: {
  state: UtilityDialogFormState;
  companies: CompanyOption[];
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
      uomOptions={props.uomOptions}
      sourceOptions={props.sourceOptions}
      consumption={props.consumption}
      status={props.status}
      attachmentError={props.attachmentError}
      updateState={props.updateState}
    />
  );
}
