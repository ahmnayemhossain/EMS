import * as React from "react";

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import type { UtilityUsagePayload } from "@/pages/UtilitiesPage/baseline-settings";
import { buildUtilityPayload } from "@/pages/UtilitiesPage/dialog/build-utility-payload";
import { CreateDialogContent } from "@/pages/UtilitiesPage/dialog/create-dialog-content";
import { createStateFromRecord } from "@/pages/UtilitiesPage/dialog/edit-dialog-state";
import { createEmptyUtilityFormState } from "@/pages/UtilitiesPage/dialog/form-state";
import { getCreateDialogErrors } from "@/pages/UtilitiesPage/dialog/utility-dialog-errors";
import { useUtilityDialogLogic } from "@/pages/UtilitiesPage/dialog/use-utility-dialog-logic";
import { useSyncedUtilityForm } from "@/pages/UtilitiesPage/dialog/use-synced-utility-form";
import type { CompanyOption } from "@/app/state/company";
import type { UtilityRecord, UtilitySourceOption, UtilityUomOption } from "@/types/ems";

export function EditUtilityDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: CompanyOption[];
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  record: UtilityRecord | null;
  onSave: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [state, setState] = React.useState(() => createEmptyUtilityFormState("", "electricity"));

  React.useEffect(() => {
    if (!props.record || !props.open) return;
    setState(createStateFromRecord(props.record));
  }, [props.open, props.record]);

  const logic = useUtilityDialogLogic(state, props.uomOptions, props.sourceOptions);
  useSyncedUtilityForm(state, setState, { logic });

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
