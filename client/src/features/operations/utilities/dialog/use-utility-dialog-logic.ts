import * as React from "react";

import { utilityAttachmentConfig, utilityTypeFieldConfig } from "@/features/operations/utilities/config/constants";
import type { UtilityDialogFormState } from "@/features/operations/utilities/dialog/form-state";
import type { UtilitySourceOption, UtilityUomOption } from "@/core/types/models/ems";

export function useUtilityDialogLogic(
  state: UtilityDialogFormState,
  uomOptions: UtilityUomOption[],
  sourceOptions: UtilitySourceOption[],
  input?: { generatorDieselKwhPerLiter?: number | null },
) {
  const baseConfig = utilityTypeFieldConfig[state.type];
  const filteredSourceOptions = React.useMemo(() => sourceOptions.filter((item) => item.utilityType === state.type), [sourceOptions, state.type]);
  const filteredUomOptions = React.useMemo(() => uomOptions.filter((item) => item.utilityType === state.type), [uomOptions, state.type]);
  const selectedSourceName = filteredSourceOptions.find((s) => s.id === state.sourceId)?.name ?? "";
  const generatorMode = state.type === "electricity" && selectedSourceName.toLowerCase() === "generator";
  const dieselLiters = state.dieselLitersInput.trim() === "" ? undefined : Number(state.dieselLitersInput);
  const previousReading = state.previousReading.trim() === "" ? undefined : Number(state.previousReading);
  const currentReading = state.currentReading.trim() === "" ? undefined : Number(state.currentReading);
  const manualConsumption = state.consumptionInput.trim() === "" ? undefined : Number(state.consumptionInput);
  const isPdfAttachment = React.useMemo(() => {
    if (!state.attachment) return true;
    const name = state.attachment.name.toLowerCase();
    const mime = (state.attachment.type || "").toLowerCase();
    if (name.endsWith(".pdf")) return true;
    return mime === "application/pdf" || mime === "application/x-pdf";
  }, [state.attachment]);

  const attachmentError =
    state.attachment && !isPdfAttachment
      ? "Only PDF files are allowed."
      : state.attachment && state.attachment.size > utilityAttachmentConfig.maxBytes
        ? "PDF file is too large. Maximum size is 10 MB."
        : "";
  const readingConsumption = typeof previousReading === "number" && !Number.isNaN(previousReading) && typeof currentReading === "number" && !Number.isNaN(currentReading)
    ? currentReading - previousReading : undefined;
  const generatorFactor = input?.generatorDieselKwhPerLiter ?? null;
  const dieselConsumption = generatorMode && typeof dieselLiters === "number" && !Number.isNaN(dieselLiters) && dieselLiters > 0 && typeof generatorFactor === "number" && generatorFactor > 0
    ? dieselLiters * generatorFactor
    : undefined;
  const hasReadingInput = generatorMode && (state.previousReading.trim() !== "" || state.currentReading.trim() !== "");
  const hasDieselInput = generatorMode && state.dieselLitersInput.trim() !== "";
  const generatorUsesReading = generatorMode && hasReadingInput;
  const generatorUsesDiesel = generatorMode && !generatorUsesReading && hasDieselInput;

  const config = generatorMode ? { ...baseConfig, allowMeterReading: true } : baseConfig;
  const effectiveManualConsumption = generatorMode ? dieselConsumption : manualConsumption;
  const consumption = generatorMode
    ? (generatorUsesReading ? readingConsumption : generatorUsesDiesel ? dieselConsumption : undefined)
    : config.allowMeterReading ? readingConsumption : effectiveManualConsumption;

  return {
    config,
    filteredSourceOptions,
    filteredUomOptions,
    previousReading,
    currentReading,
    manualConsumption: effectiveManualConsumption,
    attachmentError,
    consumption,
    generatorMode,
    generatorUsesReading,
    generatorUsesDiesel,
  };
}
