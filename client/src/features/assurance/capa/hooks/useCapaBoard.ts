import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import type { CAPA } from "@/core/types/models/ems";

import { reorderCapas } from "../config/board";
import { createCapa, deleteCapa, dismissCapa, listCapas, moveCapa, type CapaInput, updateCapa } from "../services/api";

export function useCapaBoard(userId: string, companyId?: string) {
  const [rows, setRows] = React.useState<CAPA[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const loadRows = React.useCallback(async () => {
    if (!companyId) {
      setRows([]);
      return;
    }

    setLoading(true);
    try {
      setRows(await listCapas(userId, { companyId }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load CAPA.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((item) =>
      `${item.title} ${item.owner} ${item.description ?? ""}`.toLowerCase().includes(query),
    );
  }, [rows, search]);

  const createRecord = React.useCallback(
    async (input: CapaInput) => {
      const created = await createCapa(userId, input);
      setRows((current) => [...current, created]);
      toast.success("CAPA created.");
    },
    [userId],
  );

  const updateRecord = React.useCallback(
    async (id: string, input: CapaInput) => {
      const updated = await updateCapa(userId, id, input);
      setRows((current) => current.map((item) => (item.id === id ? updated : item)));
      toast.success("CAPA updated.");
    },
    [userId],
  );

  const moveRecord = React.useCallback(
    async (id: string, status: CAPA["status"], targetIndex: number) => {
      if (!companyId) return;
      const previous = rows;
      setRows((current) => reorderCapas(current, id, status, targetIndex));

      try {
        const updated = await moveCapa(userId, id, { facilityId: companyId, status, targetIndex });
        setRows((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      } catch (error) {
        setRows(previous);
        toast.error(error instanceof Error ? error.message : "Failed to move CAPA.");
      }
    },
    [companyId, rows, userId],
  );

  const deleteRecord = React.useCallback(
    async (id: string) => {
      await deleteCapa(userId, id);
      setRows((current) => current.filter((item) => item.id !== id));
      toast.success("CAPA deleted.");
    },
    [userId],
  );

  const dismissRecord = React.useCallback(
    async (id: string, dismissed: boolean) => {
      if (!companyId) return;
      const updated = await dismissCapa(userId, id, { facilityId: companyId, dismissed });
      setRows((current) => current.map((item) => (item.id === id ? updated : item)));
      toast.success(dismissed ? "CAPA dismissed." : "CAPA restored.");
    },
    [companyId, userId],
  );

  return {
    rows,
    filteredRows,
    loading,
    search,
    setSearch,
    loadRows,
    createRecord,
    updateRecord,
    moveRecord,
    deleteRecord,
    dismissRecord,
  };
}
