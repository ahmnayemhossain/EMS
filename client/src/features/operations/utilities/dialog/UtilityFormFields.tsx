import { CreateUtilityForm } from "@/features/operations/utilities/components/CreateUtilityForm";
import type { UtilityDialogFormState } from "@/features/operations/utilities/dialog/form-state";
import type { UtilityUsageStatus } from "@/features/operations/utilities/config/baseline-settings";
import type { CompanyOption } from "@/core/app/state/slices/company";
import type { UtilityMeterOption, UtilitySourceOption, UtilityType, UtilityUomOption } from "@/core/types/models/ems";

export function UtilityFormFields(props: {
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
    <CreateUtilityForm
      {...props.state}
      companies={props.companies}
      onTypeChange={(value: UtilityType) => props.updateState("type", value)}
      meterOptions={props.meterOptions}
      onMeterIdChange={(value) => props.updateState("meterId", value)}
      onUnitChange={(value) => props.updateState("unit", value)}
      uomOptions={props.uomOptions}
      onSourceChange={(value) => props.updateState("sourceId", value)}
      sourceOptions={props.sourceOptions}
      onPeriodStartChange={(value) => props.updateState("periodStart", value)}
      onPeriodEndChange={(value) => props.updateState("periodEnd", value)}
      onMeterNameChange={(value) => props.updateState("meterName", value)}
      onPreviousReadingChange={(value) => props.updateState("previousReading", value)}
      onCurrentReadingChange={(value) => props.updateState("currentReading", value)}
      onConsumptionInputChange={(value) => props.updateState("consumptionInput", value)}
      onDieselLitersInputChange={(value) => props.updateState("dieselLitersInput", value)}
      generatorDieselKwhPerLiter={props.generatorDieselKwhPerLiter}
      consumption={props.consumption}
      status={props.status}
      coverageWarning={props.coverageWarning}
      showValidation={props.showValidation}
      onRemarksChange={(value) => props.updateState("remarks", value)}
      attachmentError={props.attachmentError}
      onAttachmentChange={(file) => props.updateState("attachment", file)}
    />
  );
}
