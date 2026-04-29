import type { UtilityType } from "@/types/ems";

export type UtilityDialogFormState = {
  companyId: string;
  type: UtilityType;
  meterName: string;
  periodStart: string;
  periodEnd: string;
  previousReading: string;
  currentReading: string;
  consumptionInput: string;
  unit: string;
  sourceId: string;
  remarks: string;
  attachment: File | null;
};

export function createEmptyUtilityFormState(companyId: string, type: UtilityType): UtilityDialogFormState {
  return {
    companyId,
    type,
    meterName: "",
    periodStart: "",
    periodEnd: "",
    previousReading: "",
    currentReading: "",
    consumptionInput: "",
    unit: "",
    sourceId: "",
    remarks: "",
    attachment: null,
  };
}
