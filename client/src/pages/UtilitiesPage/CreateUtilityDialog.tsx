import * as React from "react";

import { CreateActionDialog } from "@/components/CreateActionDialog";
import type { UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import { buildUtilityPayload } from "@/pages/UtilitiesPage/dialog/build-utility-payload";
import { CreateDialogContent } from "@/pages/UtilitiesPage/dialog/create-dialog-content";
import { createEmptyUtilityFormState } from "@/pages/UtilitiesPage/dialog/form-state";
import { getCreateDialogErrors } from "@/pages/UtilitiesPage/dialog/utility-dialog-errors";
import { useUtilityDialogLogic } from "@/pages/UtilitiesPage/dialog/use-utility-dialog-logic";
import { useSyncedUtilityForm } from "@/pages/UtilitiesPage/dialog/use-synced-utility-form";
import type { CompanyOption } from "@/app/state/company";
import type { UtilitySourceOption, UtilityType, UtilityUomOption } from "@/types/ems";

export function CreateUtilityDialog(props: {
  companies: CompanyOption[];
  defaultCompanyId: string;
  activeType: UtilityType;
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  onCreateUsage?: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [state, setState] = React.useState(() => createEmptyUtilityFormState(props.defaultCompanyId, props.activeType));
  const logic = useUtilityDialogLogic(state, props.uomOptions, props.sourceOptions);
  useSyncedUtilityForm(state, setState, {
    defaultCompanyId: props.defaultCompanyId,
    activeType: props.activeType,
    logic,
  });

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
