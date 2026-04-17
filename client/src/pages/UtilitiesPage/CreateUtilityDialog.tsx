import * as React from "react";

import { CreateActionDialog } from "@/components/CreateActionDialog";
import type { Facility, UtilityType } from "@/types/ems";

import { CreateUtilityForm } from "@/pages/UtilitiesPage/CreateUtilityForm";

export function CreateUtilityDialog({
  facilities,
  defaultFactoryId,
  activeType,
}: {
  facilities: Facility[];
  defaultFactoryId: string;
  activeType: UtilityType;
}) {
  const [factoryId, setFactoryId] = React.useState(defaultFactoryId);
  const [type, setType] = React.useState<UtilityType>(activeType);
  const [meterName, setMeterName] = React.useState("");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [value, setValue] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [min, setMin] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    setType(activeType);
  }, [activeType]);

  const valueNum = value.trim() === "" ? undefined : Number(value);
  const minNum = min.trim() === "" ? undefined : Number(min);
  const belowMin =
    typeof valueNum === "number" &&
    !Number.isNaN(valueNum) &&
    typeof minNum === "number" &&
    !Number.isNaN(minNum) &&
    valueNum < minNum;

  return (
    <CreateActionDialog
      title="Create utility record"
      submitDisabled={belowMin}
      onCreate={() => {
        if (belowMin) return false;
        return true;
      }}
    >
      <CreateUtilityForm
        facilities={facilities}
        factoryId={factoryId}
        onFactoryIdChange={setFactoryId}
        type={type}
        onTypeChange={setType}
        periodStart={periodStart}
        onPeriodStartChange={setPeriodStart}
        periodEnd={periodEnd}
        onPeriodEndChange={setPeriodEnd}
        meterName={meterName}
        onMeterNameChange={setMeterName}
        value={value}
        onValueChange={setValue}
        unit={unit}
        onUnitChange={setUnit}
        min={min}
        onMinChange={setMin}
        remarks={remarks}
        onRemarksChange={setRemarks}
        belowMin={belowMin}
        belowMinValues={{ valueNum, minNum }}
      />
    </CreateActionDialog>
  );
}

