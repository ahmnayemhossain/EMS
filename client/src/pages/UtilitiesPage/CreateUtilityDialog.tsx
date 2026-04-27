import * as React from "react";

import { CreateActionDialog } from "@/components/CreateActionDialog";
import type { Facility, UtilityType } from "@/types/ems";

import {
  getDefaultUtilityUnit,
  type UtilityUsagePayload,
} from "@/pages/UtilitiesPage/baseline-settings";
import { CreateUtilityForm } from "@/pages/UtilitiesPage/CreateUtilityForm";

export function CreateUtilityDialog({
  facilities,
  defaultFactoryId,
  activeType,
  onCreateUsage,
}: {
  facilities: Facility[];
  defaultFactoryId: string;
  activeType: UtilityType;
  onCreateUsage?: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [factoryId, setFactoryId] = React.useState(defaultFactoryId);
  const [type, setType] = React.useState<UtilityType>(activeType);
  const [meterName, setMeterName] = React.useState("");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [previousReading, setPreviousReading] = React.useState("");
  const [currentReading, setCurrentReading] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [attachment, setAttachment] = React.useState<File | null>(null);

  React.useEffect(() => {
    setFactoryId(defaultFactoryId);
  }, [defaultFactoryId]);

  React.useEffect(() => {
    setType(activeType);
  }, [activeType]);

  const previousReadingNum = previousReading.trim() === "" ? undefined : Number(previousReading);
  const currentReadingNum = currentReading.trim() === "" ? undefined : Number(currentReading);
  const consumption =
    typeof previousReadingNum === "number" &&
    !Number.isNaN(previousReadingNum) &&
    typeof currentReadingNum === "number" &&
    !Number.isNaN(currentReadingNum)
      ? currentReadingNum - previousReadingNum
      : undefined;
  const status = typeof consumption === "number" ? "normal" : undefined;

  const errors = [
    !factoryId ? "Factory is required." : "",
    !type ? "Utility type is required." : "",
    !periodStart ? "Period start is required." : "",
    !periodEnd ? "Period end is required." : "",
    !meterName.trim() ? "Meter name is required." : "",
    typeof previousReadingNum !== "number" || Number.isNaN(previousReadingNum) || previousReadingNum < 0
      ? "Previous reading must be >= 0."
      : "",
    typeof currentReadingNum !== "number" || Number.isNaN(currentReadingNum)
      ? "Current reading is required."
      : "",
    typeof currentReadingNum === "number" &&
    typeof previousReadingNum === "number" &&
    currentReadingNum < previousReadingNum
      ? "Current reading must be >= previous reading."
      : "",
    typeof consumption === "number" && consumption <= 0 ? "Consumption must be > 0." : "",
  ].filter(Boolean);

  const canCreate = errors.length === 0;

  function buildPayload(): UtilityUsagePayload | undefined {
    if (!canCreate || typeof consumption !== "number" || !status) {
      return undefined;
    }

    const unit = getDefaultUtilityUnit(type);

    return {
      factoryId,
      utilityType: type,
      periodStart,
      periodEnd,
      meterName: meterName.trim(),
      previousReading: previousReadingNum as number,
      currentReading: currentReadingNum as number,
      consumption,
      unit,
      status,
      remarks: remarks.trim() || undefined,
      attachment: attachment
        ? {
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
            uploadedAt: new Date().toISOString(),
          }
        : undefined,
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
        facilities={facilities}
        factoryId={factoryId}
        type={type}
        onTypeChange={setType}
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
        consumption={consumption}
        status={status}
        remarks={remarks}
        onRemarksChange={setRemarks}
        attachment={attachment}
        onAttachmentChange={setAttachment}
      />
    </CreateActionDialog>
  );
}
