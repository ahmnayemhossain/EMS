import * as React from "react";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";
import type { MasterWiringApi, MasterWiringVm, WiringDraft, WiringRow } from "@/features/admin/settings/modules/master-wiring/types";
import type { UtilityTypeOption } from "@/features/admin/settings/modules/services/uomSettingsApi";

export function useMasterWiring(api: MasterWiringApi): MasterWiringVm {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [wiringSearch, setWiringSearch] = React.useState("");
  const [utilityTypeFilter, setUtilityTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [entityRows, setEntityRows] = React.useState<SettingsEntity[]>([]);
  const [wiringRows, setWiringRows] = React.useState<WiringRow[]>([]);
  const [utilityTypeOptions, setUtilityTypeOptions] = React.useState<UtilityTypeOption[]>([]);
  const [entityDraft, setEntityDraft] = React.useState<SettingsEntity>({ id: "", name: "", status: 1 });
  const [wiringDraft, setWiringDraft] = React.useState<WiringDraft>({ id: "", relationId: "", utilityTypeId: "", status: 1 });
  const [entityEdit, setEntityEdit] = React.useState<SettingsEntity | null>(null);
  const [wiringEdit, setWiringEdit] = React.useState<WiringDraft | null>(null);
  const [deleteEntityId, setDeleteEntityId] = React.useState<string | null>(null);
  const [deleteWiringId, setDeleteWiringId] = React.useState<string | null>(null);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [entities, wiring, lookups] = await Promise.all([
        api.listEntities(userId),
        api.listWiring(userId),
        api.listLookups(userId),
      ]);
      setEntityRows(entities);
      setWiringRows(wiring);
      setUtilityTypeOptions(lookups.utilityTypeOptions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load settings.");
    } finally {
      setLoading(false);
    }
  }, [api, userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  return {
    userId,
    loading,
    search,
    wiringSearch,
    utilityTypeFilter,
    statusFilter,
    entityRows,
    wiringRows,
    utilityTypeOptions,
    entityDraft,
    wiringDraft,
    entityEdit,
    wiringEdit,
    deleteEntityId,
    deleteWiringId,
    setSearch,
    setWiringSearch,
    setUtilityTypeFilter,
    setStatusFilter,
    setEntityRows,
    setWiringRows,
    setEntityDraft,
    setWiringDraft,
    setEntityEdit,
    setWiringEdit,
    setDeleteEntityId,
    setDeleteWiringId,
    loadAll,
  };
}

