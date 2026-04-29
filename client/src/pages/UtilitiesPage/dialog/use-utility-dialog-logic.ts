import * as React from "react";

import { utilityAttachmentConfig, utilityTypeFieldConfig } from "@/pages/UtilitiesPage/constants";
import type { UtilityDialogFormState } from "@/pages/UtilitiesPage/dialog/form-state";
import type { UtilitySourceOption, UtilityUomOption } from "@/types/ems";

export function useUtilityDialogLogic(state: UtilityDialogFormState, uomOptions: UtilityUomOption[], sourceOptions: UtilitySourceOption[]) {
  const config = utilityTypeFieldConfig[state.type];
  const filteredSourceOptions = React.useMemo(() => sourceOptions.filter((item) => item.utilityType === state.type), [sourceOptions, state.type]);
  const filteredUomOptions = React.useMemo(() => uomOptions.filter((item) => item.utilityType === state.type), [uomOptions, state.type]);
  const previousReading = state.previousReading.trim() === "" ? undefined : Number(state.previousReading);
  const currentReading = state.currentReading.trim() === "" ? undefined : Number(state.currentReading);
  const manualConsumption = state.consumptionInput.trim() === "" ? undefined : Number(state.consumptionInput);
  const attachmentError = state.attachment && state.attachment.type !== "application/pdf" ? "Only PDF files are allowed."
    : state.attachment && state.attachment.size > utilityAttachmentConfig.maxBytes ? "PDF file is too large. Maximum size is 10 MB." : "";
  const readingConsumption = typeof previousReading === "number" && !Number.isNaN(previousReading) && typeof currentReading === "number" && !Number.isNaN(currentReading)
    ? currentReading - previousReading : undefined;
  const consumption = config.allowMeterReading ? readingConsumption : manualConsumption;

  return { config, filteredSourceOptions, filteredUomOptions, previousReading, currentReading, manualConsumption, attachmentError, consumption };
}
