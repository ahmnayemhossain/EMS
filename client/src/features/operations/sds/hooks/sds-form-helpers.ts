import type { SDSRecord } from "@/core/types/models/ems";

import { SDS_SECTION_DEFS, SDS_SECTION_TABS } from "@/features/operations/sds/config/constants";

export type SdsMetaState = {
  chemicalName: string;
  supplier: string;
  language: string;
  revisionDate: string;
  notes: string;
};

export function createEmptySdsMeta(): SdsMetaState {
  return {
    chemicalName: "",
    supplier: "",
    language: "",
    revisionDate: "",
    notes: "",
  };
}

export function buildSectionTitleById() {
  return Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, item.title]));
}

export function createEmptySdsDraftBySectionId() {
  return Object.fromEntries(SDS_SECTION_DEFS.map((item) => [item.id, ""]));
}

export function buildDraftBySectionId(record: SDSRecord) {
  return Object.fromEntries(
    SDS_SECTION_DEFS.map((item) => [
      item.id,
      record.sections.find((section) => section.id === item.id)?.summary ?? "",
    ]),
  );
}

export function buildSdsPayload(meta: SdsMetaState, draftBySectionId: Record<string, string>) {
  return {
    chemicalName: meta.chemicalName.trim(),
    supplier: meta.supplier.trim(),
    language: meta.language.trim(),
    revisionDate: meta.revisionDate,
    notes: meta.notes.trim() || undefined,
    sections: SDS_SECTION_DEFS.map((def) => ({
      id: def.id,
      title: def.title,
      summary: (draftBySectionId[def.id] ?? "").trim(),
    })),
  };
}

export function validateSdsCreate(meta: SdsMetaState, draftBySectionId: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!meta.chemicalName.trim()) errors.chemicalName = "Required";
  if (!meta.supplier.trim()) errors.supplier = "Required";
  if (!meta.language.trim()) errors.language = "Required";
  if (!meta.revisionDate.trim()) errors.revisionDate = "Required";

  for (const item of SDS_SECTION_DEFS) {
    const value = (draftBySectionId[item.id] ?? "").trim();
    if (!value) {
      errors[`sec_${item.id}`] = "Required";
    } else if (value.length < 8) {
      errors[`sec_${item.id}`] = "Too short";
    }
  }

  return errors;
}

export function findSdsErrorTabId(errors: Record<string, string>) {
  const key = Object.keys(errors).find((item) => item.startsWith("sec_"));
  const sectionId = key?.replace("sec_", "");
  return SDS_SECTION_TABS.find((item) => item.sectionIds.includes(sectionId ?? ""))?.id ?? null;
}
