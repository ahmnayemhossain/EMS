import * as React from "react";

import { toast } from "@/app/lib/toast";
import { sdsRecords } from "@/data/mock";
import { formatDate } from "@/utils/format";

import { SDS_SECTION_DEFS, SDS_SECTION_TABS } from "./constants";

export function useSdsPage() {
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>(sdsRecords[0]?.id ?? "");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editDraftBySectionId, setEditDraftBySectionId] = React.useState<Record<string, string>>({});
  const [editTab, setEditTab] = React.useState<string>("1-4");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraftBySectionId, setCreateDraftBySectionId] = React.useState<Record<string, string>>({});
  const [createTab, setCreateTab] = React.useState<string>("1-4");
  const [createMeta, setCreateMeta] = React.useState({ chemicalName: "", supplier: "", language: "", revisionDate: "", notes: "" });
  const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({});
  const filtered = React.useMemo(() => { const q = search.trim().toLowerCase(); return q ? sdsRecords.filter((item) => item.chemicalName.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q) || item.fileName.toLowerCase().includes(q)) : sdsRecords; }, [search]);
  const selected = React.useMemo(() => sdsRecords.find((item) => item.id === selectedId) ?? filtered[0], [selectedId, filtered]);
  const suppliers = React.useMemo(() => new Set(sdsRecords.map((item) => item.supplier)).size, []);
  const latestRevision = React.useMemo(() => sdsRecords.map((item) => item.revisionDate).sort().slice(-1)[0], []);
  const sectionTitleById = React.useMemo(() => Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, item.title])), []);
  React.useEffect(() => { if (!editOpen || !selected) return; setEditTab("1-4"); setEditDraftBySectionId(Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, selected.sections.find((section) => section.id === item.id)?.summary ?? ""]))); }, [editOpen, selected]);
  React.useEffect(() => { if (!createOpen) return; setCreateTab("1-4"); setCreateErrors({}); setCreateMeta({ chemicalName: "", supplier: "", language: "", revisionDate: "", notes: "" }); setCreateDraftBySectionId(Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, ""]))); }, [createOpen]);
  function validateCreate() { const errors: Record<string, string> = {}; if (!createMeta.chemicalName.trim()) errors.chemicalName = "Required"; if (!createMeta.supplier.trim()) errors.supplier = "Required"; if (!createMeta.language.trim()) errors.language = "Required"; if (!createMeta.revisionDate.trim()) errors.revisionDate = "Required"; for (const item of SDS_SECTION_DEFS) { const value = (createDraftBySectionId[item.id] ?? "").trim(); if (!value) errors[`sec_${item.id}`] = "Required"; else if (value.length < 8) errors[`sec_${item.id}`] = "Too short"; } return errors; }
  function focusFirstCreateErrorTab(errors: Record<string, string>) { const key = Object.keys(errors).find((item) => item.startsWith("sec_")); const sectionId = key?.replace("sec_", ""); const tab = SDS_SECTION_TABS.find((item) => item.sectionIds.includes(sectionId ?? "")); if (tab) setCreateTab(tab.id); }
  async function createRecord() { const errors = validateCreate(); setCreateErrors(errors); if (Object.keys(errors).length) { focusFirstCreateErrorTab(errors); toast.error("Fill all required fields"); return false; } toast.success("SDS created (mock)"); return true; }
  async function saveRecord() { toast.success("SDS saved (mock)"); return true; }
  return { search, setSearch, selectedId, setSelectedId, drawerOpen, setDrawerOpen, editOpen, setEditOpen, editDraftBySectionId, setEditDraftBySectionId, editTab, setEditTab, createOpen, setCreateOpen, createDraftBySectionId, setCreateDraftBySectionId, createTab, setCreateTab, createMeta, setCreateMeta, createErrors, filtered, selected, suppliers, latestRevision: latestRevision ? formatDate(latestRevision) : "-", sectionTitleById, createRecord, saveRecord };
}
