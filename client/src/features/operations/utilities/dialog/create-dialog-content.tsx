import type { CompanyOption } from "@/core/app/state/slices/company";
import { UtilityFormFields } from "@/features/operations/utilities/dialog/UtilityFormFields";
import type { UtilityDialogFormState } from "@/features/operations/utilities/dialog/form-state";
import type { UtilityUsageStatus } from "@/features/operations/utilities/config/baseline-settings";
import type { UtilityMeterOption, UtilitySourceOption, UtilityUomOption } from "@/core/types/models/ems";

export function CreateDialogContent(props: {
  state: UtilityDialogFormState;
  companies: CompanyOption[];
  meterOptions: UtilityMeterOption[];
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  consumption?: number;
  status?: UtilityUsageStatus;
  attachmentError?: string;
  coverageWarning?: string;
  showValidation?: boolean;
  updateState: <K extends keyof UtilityDialogFormState>(key: K, value: UtilityDialogFormState[K]) => void;
  generatorDieselKwhPerLiter?: number | null;
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
      coverageWarning={props.coverageWarning}
      showValidation={props.showValidation}
      updateState={props.updateState}
      generatorDieselKwhPerLiter={props.generatorDieselKwhPerLiter}
    />
  );
}
