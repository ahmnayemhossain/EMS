import * as React from "react";

import type { UtilityDialogFormState } from "@/features/UtilitiesPage/dialog/form-state";
import type { useUtilityDialogLogic } from "@/features/UtilitiesPage/dialog/use-utility-dialog-logic";
import type { UtilityType } from "@/core/types/ems";

type DialogLogic = ReturnType<typeof useUtilityDialogLogic>;

export function useSyncedUtilityForm(
  state: UtilityDialogFormState,
  setState: React.Dispatch<React.SetStateAction<UtilityDialogFormState>>,
  options: { defaultCompanyId?: string; activeType?: UtilityType; logic: DialogLogic },
) {
  React.useEffect(() => {
    if (!options.defaultCompanyId) return;
    setState((current) => ({ ...current, companyId: options.defaultCompanyId }));
  }, [options.defaultCompanyId, setState]);

  React.useEffect(() => {
    if (!options.activeType) return;
    setState((current) => ({ ...current, type: options.activeType }));
  }, [options.activeType, setState]);

  React.useEffect(() => {
    if (options.logic.filteredUomOptions.some((item) => item.name === state.unit)) return;
    setState((current) => ({ ...current, unit: options.logic.filteredUomOptions[0]?.name || "" }));
  }, [options.logic.filteredUomOptions, setState, state.unit]);

  React.useEffect(() => {
    if (!options.logic.config.allowSource || options.logic.filteredSourceOptions.length === 0) {
      setState((current) => ({ ...current, sourceId: "" }));
      return;
    }
    if (options.logic.filteredSourceOptions.some((item) => item.id === state.sourceId)) return;
    setState((current) => ({ ...current, sourceId: options.logic.filteredSourceOptions[0]?.id || "" }));
  }, [options.logic.config.allowSource, options.logic.filteredSourceOptions, setState, state.sourceId]);
}
