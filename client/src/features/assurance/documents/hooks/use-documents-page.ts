import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { Document } from "@/core/types/models/ems";

import { createDocumentRecord, deleteDocumentRecord, listDocuments } from "@/features/assurance/documents/services/api";

type CompanyOption = {
  id: string;
  name: string;
};

type UseDocumentsPageArgs = {
  companies: CompanyOption[];
  selectedCompanyId?: string;
};

export function useDocumentsPage(props: UseDocumentsPageArgs) {
  const { userId } = useUser();
  const [rows, setRows] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyFilter, setCompanyFilter] = React.useState<string | undefined>(props.selectedCompanyId);
  const [categoryFilter, setCategoryFilter] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<Document | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [facilityId, setFacilityId] = React.useState("");
  const [category, setCategory] = React.useState<Document["category"]>("permit");
  const [ownerDepartment, setOwnerDepartment] = React.useState("");
  const [expiresOn, setExpiresOn] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!companyFilter && props.selectedCompanyId) {
      setCompanyFilter(props.selectedCompanyId);
    }
  }, [props.selectedCompanyId, companyFilter]);

  const resetCreateForm = React.useCallback(() => {
    setTitle("");
    setFacilityId(props.selectedCompanyId || props.companies[0]?.id || "");
    setCategory("permit");
    setOwnerDepartment("");
    setExpiresOn("");
    setNotes("");
    setFile(null);
  }, [props.companies, props.selectedCompanyId]);

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      const next = await listDocuments(userId, companyFilter);
      setRows(Array.isArray(next) ? next : []);
      return Array.isArray(next) ? next : [];
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load documents.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, companyFilter]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (categoryFilter && row.category !== categoryFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [
        row.title,
        row.category,
        row.ownerDepartment,
        row.companyName,
        row.fileName,
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [rows, search, categoryFilter]);

  const clearFilters = React.useCallback(() => {
    setSearch("");
    setCompanyFilter(props.selectedCompanyId);
    setCategoryFilter(undefined);
  }, [props.selectedCompanyId]);

  const createRecord = React.useCallback(async () => {
    if (!facilityId) {
      toast.error("Select a company.");
      return false;
    }
    if (!title.trim()) {
      toast.error("Document title is required.");
      return false;
    }
    if (!ownerDepartment.trim()) {
      toast.error("Owner department is required.");
      return false;
    }
    if (!file) {
      toast.error("Document file is required.");
      return false;
    }

    try {
      const created = await createDocumentRecord(userId, {
        facilityId,
        title: title.trim(),
        category,
        ownerDepartment: ownerDepartment.trim(),
        expiresOn: expiresOn || undefined,
        notes: notes.trim() || undefined,
        file,
      });
      setRows((prev) => [created, ...prev]);
      toast.success("Document uploaded.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create document.");
      return false;
    }
  }, [category, expiresOn, facilityId, file, notes, ownerDepartment, title, userId]);

  const removeRecord = React.useCallback(
    async (document: Document) => {
      try {
        await deleteDocumentRecord(userId, document.id);
        setRows((prev) => prev.filter((item) => item.id !== document.id));
        setSelected(null);
        toast.success("Document deleted.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not delete document.");
      }
    },
    [userId],
  );

  return {
    rows: filteredRows,
    loading,
    search,
    setSearch,
    companyFilter,
    setCompanyFilter,
    categoryFilter,
    setCategoryFilter,
    selected,
    setSelected,
    createOpen,
    setCreateOpen,
    title,
    setTitle,
    facilityId,
    setFacilityId,
    category,
    setCategory,
    ownerDepartment,
    setOwnerDepartment,
    expiresOn,
    setExpiresOn,
    notes,
    setNotes,
    file,
    setFile,
    clearFilters,
    resetCreateForm,
    createRecord,
    removeRecord,
    metrics: {
      total: filteredRows.length,
      expiring: filteredRows.filter((item) => item.status === "expiring").length,
      expired: filteredRows.filter((item) => item.status === "expired").length,
    },
  };
}
