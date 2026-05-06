import * as React from "react";

import { Button } from "@/core/app/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/app/components/ui/dialog";
import type { UtilityUsagePayload } from "@/features/UtilitiesPage/baseline-settings";
import { listUtilityMeters } from "@/features/UtilitiesPage/api";
import { buildUtilityPayload } from "@/features/UtilitiesPage/dialog/build-utility-payload";
import { CreateDialogContent } from "@/features/UtilitiesPage/dialog/create-dialog-content";
import { createStateFromRecord } from "@/features/UtilitiesPage/dialog/edit-dialog-state";
import { createEmptyUtilityFormState } from "@/features/UtilitiesPage/dialog/form-state";
import { getCreateDialogErrors } from "@/features/UtilitiesPage/dialog/utility-dialog-errors";
import { useUtilityDialogLogic } from "@/features/UtilitiesPage/dialog/use-utility-dialog-logic";
import { useSyncedUtilityForm } from "@/features/UtilitiesPage/dialog/use-synced-utility-form";
import type { CompanyOption } from "@/core/app/state/company";
import type { UtilityMeterOption, UtilityRecord, UtilitySourceOption, UtilityUomOption } from "@/core/types/ems";

export function EditUtilityDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companies: CompanyOption[];
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  record: UtilityRecord | null;
  onSave: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [state, setState] = React.useState(() => createEmptyUtilityFormState("", "electricity"));
  const [meterOptions, setMeterOptions] = React.useState<UtilityMeterOption[]>([]);

  React.useEffect(() => {
    if (!props.record || !props.open) return;
    setState(createStateFromRecord(props.record));
  }, [props.open, props.record]);

  const logic = useUtilityDialogLogic(state, props.uomOptions, props.sourceOptions);
  useSyncedUtilityForm(state, setState, { logic });

  React.useEffect(() => {
    if (!props.open || !props.record) return;
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
  }, [props.open, props.record, props.userId, state.companyId, state.type]);

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
    status: props.record?.status ?? "normal",
  });

  function updateState<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Utility Usage</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!payload) return;
            const result = await props.onSave(payload);
            if (result !== false) props.onOpenChange(false);
          }}
        >
          {props.record ? (
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
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={errors.length > 0 || !payload}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
