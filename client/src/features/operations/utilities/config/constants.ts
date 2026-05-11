import type { UtilityType } from "@/core/types/models/ems";

export const utilityTypes: UtilityType[] = [
  "electricity",
  "water",
  "fuel",
  "steam",
  "refrigerant",
  "other",
];

export const utilityTypeFieldConfig: Record<
  UtilityType,
  {
    allowSource: boolean;
    allowMeterReading: boolean;
    meterLabel: string;
    manualValueLabel: string;
  }
> = {
  electricity: {
    allowSource: true,
    allowMeterReading: true,
    meterLabel: "Meter Name",
    manualValueLabel: "Consumption",
  },
  water: {
    allowSource: true,
    allowMeterReading: true,
    meterLabel: "Meter Name",
    manualValueLabel: "Consumption",
  },
  fuel: {
    allowSource: true,
    allowMeterReading: false,
    meterLabel: "Meter / Tank / Ref",
    manualValueLabel: "Consumption",
  },
  steam: {
    allowSource: false,
    allowMeterReading: true,
    meterLabel: "Meter Name",
    manualValueLabel: "Consumption",
  },
  refrigerant: {
    allowSource: false,
    allowMeterReading: false,
    meterLabel: "Reference",
    manualValueLabel: "Used Quantity",
  },
  other: {
    allowSource: false,
    allowMeterReading: false,
    meterLabel: "Reference",
    manualValueLabel: "Quantity",
  },
};

export const utilityAttachmentConfig = {
  accept: ".pdf,application/pdf",
  maxBytes: 10 * 1024 * 1024,
} as const;
