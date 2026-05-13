import * as React from "react";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { blankEntity } from "@/features/admin/settings/modules/entity-manager/helpers";
import type { EntityManagerConfig } from "@/features/admin/settings/modules/entity-manager/types";
import { listSettingsEntities, type SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";

export function useEntityManager(config: EntityManagerConfig) {
  const { userId } = useUser();
  const [rows, setRows] = React.useState<SettingsEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<SettingsEntity | null>(null);
  const [editDraft, setEditDraft] = React.useState<SettingsEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<SettingsEntity>(() => blankEntity());
  const [createErrors, setCreateErrors] = React.useState({});
  const [editErrors, setEditErrors] = React.useState({});

  const loadRows = React.useCallback(async () => {
    try { setLoading(true); setRows(await listSettingsEntities(config.kind, userId)); } catch (error) { toast.error(error instanceof Error ? error.message : `Could not load ${config.title.toLowerCase()}`); } finally { setLoading(false); }
  }, [config.kind, config.title, userId]);

  React.useEffect(() => { void loadRows(); }, [loadRows]);
  React.useEffect(() => { if (createOpen) { setDraft(blankEntity()); setCreateErrors({}); } }, [createOpen]);

  const filteredRows = React.useMemo(() => rows.filter((row) => !search.trim() || row.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => (a.name > b.name ? 1 : -1)), [rows, search]);
  return { userId, rows, loading, search, selected, editDraft, confirmDelete, createOpen, draft, createErrors, editErrors, filteredRows, setRows, setSearch, setSelected, setEditDraft, setConfirmDelete, setCreateOpen, setDraft, setCreateErrors, setEditErrors, loadRows };
}

