import * as React from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import type { CompanyOption } from "@/app/state/company";
import type { UtilityRecord, UtilitySourceOption, UtilityType, UtilityUomOption } from "@/types/ems";

import { type UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import { utilityAttachmentConfig, utilityTypeFieldConfig } from "@/pages/UtilitiesPage/constants";
import { CreateUtilityForm } from "@/pages/UtilitiesPage/CreateUtilityForm";

export function EditUtilityDialog({
  open,
  onOpenChange,
  companies,
  uomOptions,
  sourceOptions,
  record,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: CompanyOption[];
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  record: UtilityRecord | null;
  onSave: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [type, setType] = React.useState<UtilityType>("electricity");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [meterName, setMeterName] = React.useState("");
  const [previousReading, setPreviousReading] = React.useState("");
  const [currentReading, setCurrentReading] = React.useState("");
  const [consumptionInput, setConsumptionInput] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [sourceId, setSourceId] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [attachment, setAttachment] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!record || !open) return;
    setType(record.type);
    setPeriodStart(record.periodStart);
    setPeriodEnd(record.periodEnd);
    setMeterName(record.meterName);
    setPreviousReading(String(record.previousReading ?? ""));
    setCurrentReading(String(record.currentReading ?? ""));
    setConsumptionInput(String(record.value ?? ""));
    setUnit(record.uom);
    setSourceId(record.sourceId ?? "");
    setRemarks(record.remarks ?? "");
    setAttachment(null);
  }, [open, record]);

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
  const canSave =
    Boolean(record?.facilityId) &&
    Boolean(type) &&
    Boolean(unit) &&
    (!config.allowSource || filteredSourceOptions.length === 0 || Boolean(sourceId)) &&
    Boolean(periodStart) &&
    Boolean(periodEnd) &&
    Boolean(meterName.trim()) &&
    !attachmentError &&
    (!config.allowMeterReading ||
      (typeof previousReadingNum === "number" &&
        !Number.isNaN(previousReadingNum) &&
        previousReadingNum >= 0 &&
        typeof currentReadingNum === "number" &&
        !Number.isNaN(currentReadingNum) &&
        currentReadingNum >= previousReadingNum)) &&
    (config.allowMeterReading ||
      (typeof manualConsumptionNum === "number" && !Number.isNaN(manualConsumptionNum) && manualConsumptionNum > 0)) &&
    typeof consumption === "number" &&
    consumption > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!record || !canSave || typeof consumption !== "number" || !status) return;

    const result = await onSave({
      companyId: record.facilityId,
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
    });

    if (result !== false) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Utility Usage</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {record ? (
            <CreateUtilityForm
              companies={companies}
              companyId={record.facilityId}
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
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
