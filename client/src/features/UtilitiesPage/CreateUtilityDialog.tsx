import * as React from "react";

import { CreateActionDialog } from "@/core/components/CreateActionDialog";
import type { UtilityUsagePayload } from "@/features/UtilitiesPage/baseline-settings";
import { listUtilityMeters } from "@/features/UtilitiesPage/api";
import { buildUtilityPayload } from "@/features/UtilitiesPage/dialog/build-utility-payload";
import { CreateDialogContent } from "@/features/UtilitiesPage/dialog/create-dialog-content";
import { createEmptyUtilityFormState } from "@/features/UtilitiesPage/dialog/form-state";
import { getCreateDialogErrors } from "@/features/UtilitiesPage/dialog/utility-dialog-errors";
import { useUtilityDialogLogic } from "@/features/UtilitiesPage/dialog/use-utility-dialog-logic";
import { useSyncedUtilityForm } from "@/features/UtilitiesPage/dialog/use-synced-utility-form";
import type { CompanyOption } from "@/core/app/state/company";
import type { UtilityMeterOption, UtilitySourceOption, UtilityType, UtilityUomOption } from "@/core/types/ems";

export function CreateUtilityDialog(props: {
  userId: string;
  companies: CompanyOption[];
  defaultCompanyId: string;
  activeType: UtilityType;
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  onCreateUsage?: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [state, setState] = React.useState(() => createEmptyUtilityFormState(props.defaultCompanyId, props.activeType));
  const [meterOptions, setMeterOptions] = React.useState<UtilityMeterOption[]>([]);
  const logic = useUtilityDialogLogic(state, props.uomOptions, props.sourceOptions);
  useSyncedUtilityForm(state, setState, {
    defaultCompanyId: props.defaultCompanyId,
    activeType: props.activeType,
    logic,
  });

  React.useEffect(() => {
    let cancelled = false;
    async function loadMeters() {
      try {
        const meters = await listUtilityMeters(props.userId, { companyId: state.companyId, type: state.type });
        if (!cancelled) setMeterOptions(meters);
      } catch {
        if (!cancelled) setMeterOptions([]);
      }
    }
    void loadMeters();
    return () => {
      cancelled = true;
    };
  }, [props.userId, state.companyId, state.type]);

  React.useEffect(() => {
    if (state.meterId === "custom") return;
    const meter = meterOptions.find((m) => m.id === state.meterId);
    if (!meter) return;
    setState((current) => ({
      ...current,
      meterName: meter.name,
      unit: meter.uom,
      sourceId: meter.sourceId ?? "",
    }));
  }, [meterOptions, state.meterId, setState]);

  const errors = getCreateDialogErrors({
    state,
    attachmentError: logic.attachmentError,
    consumption: logic.consumption,
    config: logic.config,
    filteredSourceOptions: logic.filteredSourceOptions,
    previousReading: logic.previousReading,
    currentReading: logic.currentReading,
    manualConsumption: logic.manualConsumption,
  });

  const payload = buildUtilityPayload({
    state,
    config: logic.config,
    filteredSourceOptions: logic.filteredSourceOptions,
    previousReading: logic.previousReading,
    currentReading: logic.currentReading,
    consumption: logic.consumption,
    status: "normal",
  });

  function updateState<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  return (
    <CreateActionDialog
      title="Add Utility Usage"
      submitLabel="Create Usage Record"
      contentClassName="sm:max-w-3xl"
      submitDisabled={errors.length > 0 || !payload}
      onCreate={() => (payload ? props.onCreateUsage?.(payload) : false)}
    >
      <CreateDialogContent
        state={state}
        companies={props.companies}
        meterOptions={meterOptions}
        uomOptions={logic.filteredUomOptions}
        sourceOptions={logic.filteredSourceOptions}
        consumption={logic.consumption}
        status={payload?.status}
        attachmentError={logic.attachmentError}
        updateState={updateState}
      />
    </CreateActionDialog>
  );
}
