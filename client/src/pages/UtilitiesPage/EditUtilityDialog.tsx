import * as React from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import type { Facility, UtilityRecord, UtilityType } from "@/types/ems";

import { getDefaultUtilityUnit, type UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import { CreateUtilityForm } from "@/pages/UtilitiesPage/CreateUtilityForm";

export function EditUtilityDialog({
  open,
  onOpenChange,
  facilities,
  record,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilities: Facility[];
  record: UtilityRecord | null;
  onSave: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [type, setType] = React.useState<UtilityType>("electricity");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [meterName, setMeterName] = React.useState("");
  const [previousReading, setPreviousReading] = React.useState("");
  const [currentReading, setCurrentReading] = React.useState("");
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
    setRemarks(record.remarks ?? "");
    setAttachment(null);
  }, [open, record]);

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
  const canSave =
    Boolean(record?.facilityId) &&
    Boolean(type) &&
    Boolean(periodStart) &&
    Boolean(periodEnd) &&
    Boolean(meterName.trim()) &&
    typeof previousReadingNum === "number" &&
    !Number.isNaN(previousReadingNum) &&
    previousReadingNum >= 0 &&
    typeof currentReadingNum === "number" &&
    !Number.isNaN(currentReadingNum) &&
    currentReadingNum >= previousReadingNum &&
    typeof consumption === "number" &&
    consumption > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!record || !canSave || typeof consumption !== "number" || !status) return;

    const result = await onSave({
      factoryId: record.facilityId,
      utilityType: type,
      periodStart,
      periodEnd,
      meterName: meterName.trim(),
      previousReading: previousReadingNum as number,
      currentReading: currentReadingNum as number,
      consumption,
      unit: getDefaultUtilityUnit(type),
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
              facilities={facilities}
              factoryId={record.facilityId}
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
