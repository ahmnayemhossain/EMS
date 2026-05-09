import type { UtilityType } from "@/core/types/ems";

export type UtilityDialogFormState = {
  companyId: string;
  type: UtilityType;
  meterId: string;
  meterName: string;
  periodStart: string;
  periodEnd: string;
  previousReading: string;
  currentReading: string;
  consumptionInput: string;
  dieselLitersInput: string;
  unit: string;
  sourceId: string;
  remarks: string;
  attachment: File | null;
};

export function createEmptyUtilityFormState(companyId: string, type: UtilityType): UtilityDialogFormState {
  return {
    companyId,
    type,
    meterId: "",
    meterName: "",
    periodStart: "",
    periodEnd: "",
    previousReading: "",
    currentReading: "",
    consumptionInput: "",
    dieselLitersInput: "",
    unit: "",
    sourceId: "",
    remarks: "",
    attachment: null,
  };
}
