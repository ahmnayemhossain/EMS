import * as React from "react";
import { useLocation } from "react-router";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { SDSRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

import { createSdsRecord, listSdsRecords, updateSdsRecord, uploadSdsPdf } from "../services/api";
import {
  buildDraftBySectionId,
  buildSdsPayload,
  buildSectionTitleById,
  createEmptySdsDraftBySectionId,
  createEmptySdsMeta,
  findSdsErrorTabId,
  validateSdsCreate,
} from "./sds-form-helpers";
import { useSdsImport } from "./use-sds-import";

export function useSdsPage() {
  const { userId } = useUser();
  const location = useLocation();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<SDSRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editMeta, setEditMeta] = React.useState(createEmptySdsMeta);
  const [editDraftBySectionId, setEditDraftBySectionId] = React.useState<Record<string, string>>({});
  const [editTab, setEditTab] = React.useState<string>("1-4");
  const [editFile, setEditFile] = React.useState<File | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraftBySectionId, setCreateDraftBySectionId] = React.useState<Record<string, string>>({});
  const [createTab, setCreateTab] = React.useState<string>("1-4");
  const [createMeta, setCreateMeta] = React.useState(createEmptySdsMeta);
  const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({});
  const [createFile, setCreateFile] = React.useState<File | null>(null);

  const sectionTitleById = React.useMemo(
    () => buildSectionTitleById(),
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
    setEditFile(null);
    setEditMeta({
      chemicalName: selected.chemicalName || "",
      supplier: selected.supplier || "",
      language: selected.language || "",
      revisionDate: selected.revisionDate || "",
      notes: selected.notes || "",
    });
    setEditDraftBySectionId(buildDraftBySectionId(selected));
  }, [editOpen, selected]);

  React.useEffect(() => {
    if (!createOpen) return;

    setCreateTab("1-4");
    setCreateErrors({});
    setCreateFile(null);
    setCreateMeta(createEmptySdsMeta());
    setCreateDraftBySectionId(createEmptySdsDraftBySectionId());
  }, [createOpen]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const id = params.get("sdsId");
    if (!id) return;
    setSelectedId(id);
    setDrawerOpen(true);
  }, [location.search]);

  async function createRecord() {
    const errors = validateSdsCreate(createMeta, createDraftBySectionId);
    setCreateErrors(errors);
    if (Object.keys(errors).length) {
      const errorTabId = findSdsErrorTabId(errors);
      if (errorTabId) {
        setCreateTab(errorTabId);
      }
      toast.error("Fill all required fields");
      return false;
    }

    try {
      let created = await createSdsRecord(userId, buildSdsPayload(createMeta, createDraftBySectionId));

      if (createFile) {
        created = await uploadSdsPdf(userId, {
          sdsId: created.id,
          file: createFile,
        });
      }

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
      let updated = await updateSdsRecord(userId, selected.id, buildSdsPayload(editMeta, editDraftBySectionId));

      if (editFile) {
        updated = await uploadSdsPdf(userId, {
          sdsId: selected.id,
          file: editFile,
        });
      }

      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      toast.success("SDS saved");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
      return false;
    }
  }

  const sdsImport = useSdsImport({
    userId,
    reload: load,
    onImported: (firstRecordId) => {
      setSelectedId(firstRecordId);
    },
  });

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
    editFile,
    setEditFile,
    createOpen,
    setCreateOpen,
    createDraftBySectionId,
    setCreateDraftBySectionId,
    createTab,
    setCreateTab,
    createMeta,
    setCreateMeta,
    createErrors,
    createFile,
    setCreateFile,
    filtered,
    selected,
    suppliers,
    latestRevision: latestRevision ? formatDate(latestRevision) : "-",
    importing: sdsImport.importing,
    importValidationOpen: sdsImport.importValidationOpen,
    setImportValidationOpen: sdsImport.setImportValidationOpen,
    importValidationFileName: sdsImport.importValidationFileName,
    importValidationIssues: sdsImport.importValidationIssues,
    sectionTitleById,
    downloadTemplate: sdsImport.downloadTemplate,
    importCsvFile: sdsImport.importCsvFile,
    createRecord,
    saveRecord,
    reload: load,
  };
}
