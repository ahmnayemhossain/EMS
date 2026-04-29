import * as React from "react";

import { CreateActionDialog } from "@/components/CreateActionDialog";
import type { CompanyOption } from "@/app/state/company";
import type { UtilitySourceOption, UtilityType, UtilityUomOption } from "@/types/ems";

import { type UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import { utilityAttachmentConfig, utilityTypeFieldConfig } from "@/pages/UtilitiesPage/constants";
import { CreateUtilityForm } from "@/pages/UtilitiesPage/CreateUtilityForm";

export function CreateUtilityDialog({
  companies,
  defaultCompanyId,
  activeType,
  uomOptions,
  sourceOptions,
  onCreateUsage,
}: {
  companies: CompanyOption[];
  defaultCompanyId: string;
  activeType: UtilityType;
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  onCreateUsage?: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [companyId, setCompanyId] = React.useState(defaultCompanyId);
  const [type, setType] = React.useState<UtilityType>(activeType);
  const [meterName, setMeterName] = React.useState("");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [previousReading, setPreviousReading] = React.useState("");
  const [currentReading, setCurrentReading] = React.useState("");
  const [consumptionInput, setConsumptionInput] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [sourceId, setSourceId] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [attachment, setAttachment] = React.useState<File | null>(null);

  React.useEffect(() => {
    setCompanyId(defaultCompanyId);
  }, [defaultCompanyId]);

  React.useEffect(() => {
    setType(activeType);
  }, [activeType]);

  const filteredSourceOptions = React.useMemo(
    () => sourceOptions.filter((item) => item.utilityType === type),
    [type, sourceOptions],
  );
  const filteredUomOptions = React.useMemo(
    () => uomOptions.filter((item) => item.utilityType === type),
    [type, uomOptions],
  );
  const config = utilityTypeFieldConfig[type];
  React.useEffect(() => {
    if (filteredUomOptions.some((item) => item.name === unit)) return;
    setUnit(filteredUomOptions[0]?.name || "");
  }, [filteredUomOptions, unit]);
  React.useEffect(() => {
    if (!config.allowSource || filteredSourceOptions.length === 0) {
      setSourceId("");
    } else if (filteredSourceOptions.some((item) => item.id === sourceId)) {
      return;
    }
    setSourceId(filteredSourceOptions[0]?.id || "");
  }, [config.allowSource, filteredSourceOptions, sourceId]);

  const previousReadingNum = previousReading.trim() === "" ? undefined : Number(previousReading);
  const currentReadingNum = currentReading.trim() === "" ? undefined : Number(currentReading);
  const manualConsumptionNum = consumptionInput.trim() === "" ? undefined : Number(consumptionInput);
  const attachmentError =
    attachment && attachment.type !== "application/pdf"
      ? "Only PDF files are allowed."
      : attachment && attachment.size > utilityAttachmentConfig.maxBytes
        ? "PDF file is too large. Maximum size is 10 MB."
        : "";
  const readingConsumption =
    typeof previousReadingNum === "number" &&
    !Number.isNaN(previousReadingNum) &&
    typeof currentReadingNum === "number" &&
    !Number.isNaN(currentReadingNum)
      ? currentReadingNum - previousReadingNum
      : undefined;
  const consumption = config.allowMeterReading ? readingConsumption : manualConsumptionNum;
  const status = typeof consumption === "number" ? "normal" : undefined;

  const errors = [
    !companyId ? "Company is required." : "",
    !type ? "Utility type is required." : "",
    !unit ? "UOM is required." : "",
    config.allowSource && filteredSourceOptions.length > 0 && !sourceId ? "Source is required." : "",
    !periodStart ? "Period start is required." : "",
    !periodEnd ? "Period end is required." : "",
    !meterName.trim() ? `${config.meterLabel} is required.` : "",
    attachmentError,
    config.allowMeterReading &&
    (typeof previousReadingNum !== "number" || Number.isNaN(previousReadingNum) || previousReadingNum < 0)
      ? "Previous reading must be >= 0."
      : "",
    config.allowMeterReading && (typeof currentReadingNum !== "number" || Number.isNaN(currentReadingNum))
      ? "Current reading is required."
      : "",
    config.allowMeterReading &&
    typeof currentReadingNum === "number" &&
    typeof previousReadingNum === "number" &&
    currentReadingNum < previousReadingNum
      ? "Current reading must be >= previous reading."
      : "",
    !config.allowMeterReading &&
    (typeof manualConsumptionNum !== "number" || Number.isNaN(manualConsumptionNum) || manualConsumptionNum <= 0)
      ? `${config.manualValueLabel} must be > 0.`
      : "",
    typeof consumption === "number" && consumption <= 0 ? "Consumption must be > 0." : "",
  ].filter(Boolean);

  const canCreate = errors.length === 0;

  function buildPayload(): UtilityUsagePayload | undefined {
    if (!canCreate || typeof consumption !== "number" || !status) {
      return undefined;
    }

    return {
      companyId,
      utilityType: type,
      meterName: meterName.trim(),
      sourceId: config.allowSource ? sourceId || undefined : undefined,
      sourceName: filteredSourceOptions.find((item) => item.id === sourceId)?.name,
      periodStart,
      periodEnd,
      previousReading: config.allowMeterReading ? (previousReadingNum as number) : undefined,
      currentReading: config.allowMeterReading ? (currentReadingNum as number) : undefined,
      consumption,
      unit,
      status,
      remarks: remarks.trim() || undefined,
      attachment,
    };
  }

  return (
    <CreateActionDialog
      title="Add Utility Usage"
      submitLabel="Create Usage Record"
      contentClassName="sm:max-w-3xl"
      submitDisabled={!canCreate}
      onCreate={() => {
        const payload = buildPayload();
        if (!payload) return false;
        return onCreateUsage?.(payload);
      }}
    >
      <CreateUtilityForm
        companies={companies}
        companyId={companyId}
        type={type}
        onTypeChange={setType}
        unit={unit}
        onUnitChange={setUnit}
        uomOptions={filteredUomOptions}
        sourceId={sourceId}
        onSourceChange={setSourceId}
        sourceOptions={filteredSourceOptions}
        periodStart={periodStart}
        onPeriodStartChange={setPeriodStart}
        periodEnd={periodEnd}
        onPeriodEndChange={setPeriodEnd}
        meterName={meterName}
        onMeterNameChange={setMeterName}
        previousReading={previousReading}
        onPreviousReadingChange={setPreviousReading}
        currentReading={currentReading}
        onCurrentReadingChange={setCurrentReading}
        consumptionInput={consumptionInput}
        onConsumptionInputChange={setConsumptionInput}
        consumption={consumption}
        status={status}
        remarks={remarks}
        onRemarksChange={setRemarks}
        attachment={attachment}
        attachmentError={attachmentError}
        onAttachmentChange={setAttachment}
      />
    </CreateActionDialog>
  );
}
