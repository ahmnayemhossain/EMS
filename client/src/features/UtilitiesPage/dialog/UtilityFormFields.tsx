import { CreateUtilityForm } from "@/features/UtilitiesPage/CreateUtilityForm";
import type { UtilityDialogFormState } from "@/features/UtilitiesPage/dialog/form-state";
import type { UtilityUsageStatus } from "@/features/UtilitiesPage/baseline-settings";
import type { CompanyOption } from "@/core/app/state/company";
import type { UtilityMeterOption, UtilitySourceOption, UtilityType, UtilityUomOption } from "@/core/types/ems";

export function UtilityFormFields(props: {
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
      consumption={props.consumption}
      status={props.status}
      onRemarksChange={(value) => props.updateState("remarks", value)}
      attachmentError={props.attachmentError}
      onAttachmentChange={(file) => props.updateState("attachment", file)}
    />
  );
}
