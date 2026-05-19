import * as React from "react";

import { Button } from "@/components/ui/primitives/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives/dialog";
import { ActionModal } from "@/components/feedback/ActionModal";
import type { UtilityUsagePayload } from "@/features/operations/utilities/config/baseline-settings";
import { listUtilityMeters } from "@/features/operations/utilities/services/api";
import { buildUtilityPayload } from "@/features/operations/utilities/dialog/build-utility-payload";
import { getCoveragePreview } from "@/features/operations/utilities/dialog/coverage-preview";
import { CreateDialogContent } from "@/features/operations/utilities/dialog/create-dialog-content";
import { createStateFromRecord } from "@/features/operations/utilities/dialog/edit-dialog-state";
import { createEmptyUtilityFormState } from "@/features/operations/utilities/dialog/form-state";
import { getCreateDialogErrors } from "@/features/operations/utilities/dialog/utility-dialog-errors";
import { useUtilityDialogLogic } from "@/features/operations/utilities/dialog/use-utility-dialog-logic";
import { useSyncedUtilityForm } from "@/features/operations/utilities/dialog/use-synced-utility-form";
import type { CompanyOption } from "@/core/app/state/slices/company";
import type { UtilityMeterOption, UtilityRecord, UtilitySourceOption, UtilityUomOption } from "@/core/types/models/ems";

export function EditUtilityDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companies: CompanyOption[];
  uomOptions: UtilityUomOption[];
  sourceOptions: UtilitySourceOption[];
  record: UtilityRecord | null;
  existingRecords: UtilityRecord[];
  onSave: (payload: UtilityUsagePayload) => void | boolean | Promise<void | boolean>;
}) {
  const [state, setState] = React.useState(() => createEmptyUtilityFormState("", "electricity"));
  const [meterOptions, setMeterOptions] = React.useState<UtilityMeterOption[]>([]);
  const [showValidation, setShowValidation] = React.useState(false);
  const [validationOpen, setValidationOpen] = React.useState(false);

  React.useEffect(() => {
    if (!props.record || !props.open) return;
    setState(createStateFromRecord(props.record));
    setShowValidation(false);
  }, [props.open, props.record]);

  const logic = useUtilityDialogLogic(state, props.uomOptions, props.sourceOptions);
  useSyncedUtilityForm(state, setState, { logic });

  React.useEffect(() => {
    if (!props.open || !props.record) return;
    let cancelled = false;
    async function loadMeters() {
      try {
        const meters = await listUtilityMeters(props.userId, {
          companyId: state.companyId,
          type: state.type,
          sourceId: state.sourceId || undefined,
        });
        if (!cancelled) setMeterOptions(meters);
      } catch {
        if (!cancelled) setMeterOptions([]);
      }
    }
    void loadMeters();
    return () => {
      cancelled = true;
    };
  }, [props.open, props.record, props.userId, state.companyId, state.type, state.sourceId]);

  React.useEffect(() => {
    if (!state.meterId) return;
    const meter = meterOptions.find((m) => m.id === state.meterId);
    if (!meter) return;
    setState((current) => ({
      ...current,
      meterName: meter.name,
      unit: meter.uom,
      sourceId: meter.sourceId ?? "",
    }));
  }, [meterOptions, state.meterId, setState]);

  React.useEffect(() => {
    if (!state.meterId) return;
    const currentMeter = meterOptions.find((meter) => meter.id === state.meterId);
    if (currentMeter) return;
    setState((current) => ({
      ...current,
      meterId: "",
      meterName: "",
      unit: "",
      previousReading: "",
      currentReading: "",
      consumptionInput: "",
    }));
  }, [meterOptions, setState, state.meterId]);

  React.useEffect(() => {
    const selectedSourceName = props.sourceOptions.find((s) => s.id === state.sourceId)?.name ?? "";
    const generatorMode = state.type === "electricity" && selectedSourceName.toLowerCase() === "generator";
    if (!generatorMode) return;
    setState((current) => (current.unit === "kWh" ? current : { ...current, unit: "kWh" }));
  }, [props.sourceOptions, setState, state.sourceId, state.type]);

  const coveragePreview = getCoveragePreview({ state, existingRecords: props.existingRecords, excludeRecordId: props.record?.id });
  const errors = [
    ...getCreateDialogErrors({
      state,
      attachmentError: logic.attachmentError,
      consumption: logic.consumption,
      generatorMode: logic.generatorMode,
      config: logic.config,
      filteredSourceOptions: logic.filteredSourceOptions,
      previousReading: logic.previousReading,
      currentReading: logic.currentReading,
      manualConsumption: logic.manualConsumption,
    }),
    coveragePreview.error,
  ].filter(Boolean);
  const validationMessage = showValidation ? coveragePreview.error || errors[0] || "" : "";

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
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Utility Usage</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setShowValidation(true);
              if (errors.length > 0 || !payload) {
                setValidationOpen(true);
                return;
              }
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
                coverageWarning={coveragePreview.warning}
                showValidation={showValidation}
                updateState={updateState}
              />
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ActionModal
        open={validationOpen}
        onOpenChange={setValidationOpen}
        tone="warning"
        title="Unable to update utility record"
        description={validationMessage || "Please fix the highlighted fields and try again."}
        confirmLabel="Got it"
        cancelLabel="Close"
        onConfirm={async () => {}}
      />
    </>
  );
}

