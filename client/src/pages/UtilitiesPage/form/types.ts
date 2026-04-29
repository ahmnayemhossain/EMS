import type { CompanyOption } from "@/app/state/company";
import type { UtilityUsageStatus } from "@/pages/UtilitiesPage/baseline-settings";
import type { UtilitySourceOption, UtilityType, UtilityUomOption } from "@/types/ems";

export type UtilityFormProps = {
  companies: CompanyOption[];
  companyId: string;
  type: UtilityType;
  onTypeChange: (value: UtilityType) => void;
  unit: string;
  onUnitChange: (value: string) => void;
  uomOptions: UtilityUomOption[];
  sourceId: string;
  onSourceChange: (value: string) => void;
  sourceOptions: UtilitySourceOption[];
  periodStart: string;
  onPeriodStartChange: (value: string) => void;
  periodEnd: string;
  onPeriodEndChange: (value: string) => void;
  meterName: string;
  onMeterNameChange: (value: string) => void;
  previousReading: string;
  onPreviousReadingChange: (value: string) => void;
  currentReading: string;
  onCurrentReadingChange: (value: string) => void;
  consumptionInput: string;
  onConsumptionInputChange: (value: string) => void;
  consumption?: number;
  status?: UtilityUsageStatus;
  remarks: string;
  onRemarksChange: (value: string) => void;
  attachment: File | null;
  attachmentError?: string;
  onAttachmentChange: (file: File | null) => void;
};

export type UtilityFormErrors = {
  company: string;
  type: string;
  unit: string;
  source: string;
  periodStart: string;
  periodEnd: string;
  meterName: string;
  previousReading: string;
  currentReading: string;
  consumption: string;
};
