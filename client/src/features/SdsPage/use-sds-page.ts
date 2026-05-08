import * as React from "react";
import { useLocation } from "react-router";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/user";
import type { SDSRecord } from "@/core/types/ems";
import { formatDate } from "@/core/utils/format";

import { createSdsRecord, listSdsRecords, updateSdsRecord } from "./api";
import { SDS_SECTION_DEFS, SDS_SECTION_TABS } from "./constants";

export function useSdsPage() {
  const { userId } = useUser();
  const location = useLocation();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<SDSRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editMeta, setEditMeta] = React.useState({
    chemicalName: "",
    supplier: "",
    language: "",
    revisionDate: "",
    notes: "",
  });
  const [editDraftBySectionId, setEditDraftBySectionId] = React.useState<Record<string, string>>({});
  const [editTab, setEditTab] = React.useState<string>("1-4");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraftBySectionId, setCreateDraftBySectionId] = React.useState<Record<string, string>>({});
  const [createTab, setCreateTab] = React.useState<string>("1-4");
  const [createMeta, setCreateMeta] = React.useState({
    chemicalName: "",
    supplier: "",
    language: "",
    revisionDate: "",
    notes: "",
  });
  const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({});

  const sectionTitleById = React.useMemo(
    () => Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, item.title])),
    [],
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSdsRecords(userId);
      setRows(data);
      setSelectedId((current) => current || data[0]?.id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load SDS records.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.chemicalName.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const selected = React.useMemo(
    () => rows.find((item) => item.id === selectedId) ?? filtered[0],
    [rows, selectedId, filtered],
  );

  const suppliers = React.useMemo(() => new Set(rows.map((item) => item.supplier)).size, [rows]);
  const latestRevision = React.useMemo(
    () => rows.map((item) => item.revisionDate).sort().slice(-1)[0],
    [rows],
  );

  React.useEffect(() => {
    if (!editOpen || !selected) return;
    setEditTab("1-4");
    setEditMeta({
      chemicalName: selected.chemicalName || "",
      supplier: selected.supplier || "",
      language: selected.language || "",
      revisionDate: selected.revisionDate || "",
      notes: selected.notes || "",
    });
    setEditDraftBySectionId(
      Object.fromEntries(
        SDS_SECTION_DEFS.map((item) => [
          item.id,
          selected.sections.find((section) => section.id === item.id)?.summary ?? "",
        ]),
      ),
    );
  }, [editOpen, selected]);

  React.useEffect(() => {
    if (!createOpen) return;
    setCreateTab("1-4");
    setCreateErrors({});
    setCreateMeta({ chemicalName: "", supplier: "", language: "", revisionDate: "", notes: "" });
    setCreateDraftBySectionId(Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, ""])));
  }, [createOpen]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const id = params.get("sdsId");
    if (!id) return;
    setSelectedId(id);
    setDrawerOpen(true);
  }, [location.search]);

  function validateCreate() {
    const errors: Record<string, string> = {};
    if (!createMeta.chemicalName.trim()) errors.chemicalName = "Required";
    if (!createMeta.supplier.trim()) errors.supplier = "Required";
    if (!createMeta.language.trim()) errors.language = "Required";
    if (!createMeta.revisionDate.trim()) errors.revisionDate = "Required";
    for (const item of SDS_SECTION_DEFS) {
      const value = (createDraftBySectionId[item.id] ?? "").trim();
      if (!value) errors[`sec_${item.id}`] = "Required";
      else if (value.length < 8) errors[`sec_${item.id}`] = "Too short";
    }
    return errors;
  }

  function focusFirstCreateErrorTab(errors: Record<string, string>) {
    const key = Object.keys(errors).find((item) => item.startsWith("sec_"));
    const sectionId = key?.replace("sec_", "");
    const tab = SDS_SECTION_TABS.find((item) => item.sectionIds.includes(sectionId ?? ""));
    if (tab) setCreateTab(tab.id);
  }

  async function createRecord() {
    const errors = validateCreate();
    setCreateErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstCreateErrorTab(errors);
      toast.error("Fill all required fields");
      return false;
    }

    try {
      const created = await createSdsRecord(userId, {
        chemicalName: createMeta.chemicalName.trim(),
        supplier: createMeta.supplier.trim(),
        language: createMeta.language.trim(),
        revisionDate: createMeta.revisionDate,
        notes: createMeta.notes.trim() || undefined,
        sections: SDS_SECTION_DEFS.map((def) => ({
          id: def.id,
          title: def.title,
          summary: (createDraftBySectionId[def.id] ?? "").trim(),
        })),
      });
      setRows((current) => [created, ...current]);
      setSelectedId(created.id);
      toast.success("SDS created");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Create failed");
      return false;
    }
  }

  async function saveRecord() {
    if (!selected) return false;
    try {
      const updated = await updateSdsRecord(userId, selected.id, {
        chemicalName: editMeta.chemicalName.trim(),
        supplier: editMeta.supplier.trim(),
        language: editMeta.language.trim(),
        revisionDate: editMeta.revisionDate,
        notes: editMeta.notes.trim() || undefined,
        sections: SDS_SECTION_DEFS.map((def) => ({
          id: def.id,
          title: def.title,
          summary: (editDraftBySectionId[def.id] ?? "").trim(),
        })),
      });
      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      toast.success("SDS saved");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
      return false;
    }
  }

  return {
    loading,
    search,
    setSearch,
    selectedId,
    setSelectedId,
    drawerOpen,
    setDrawerOpen,
    editOpen,
    setEditOpen,
    editMeta,
    setEditMeta,
    editDraftBySectionId,
    setEditDraftBySectionId,
    editTab,
    setEditTab,
    createOpen,
    setCreateOpen,
    createDraftBySectionId,
    setCreateDraftBySectionId,
    createTab,
    setCreateTab,
    createMeta,
    setCreateMeta,
    createErrors,
    filtered,
    selected,
    suppliers,
    latestRevision: latestRevision ? formatDate(latestRevision) : "-",
    sectionTitleById,
    createRecord,
    saveRecord,
    reload: load,
  };
}
