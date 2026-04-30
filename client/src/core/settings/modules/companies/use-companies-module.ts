import * as React from "react";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/user";
import { blankCompany } from "@/core/settings/modules/companies/helpers";
import { listCompanies, type CompanyEntity } from "@/core/settings/modules/companiesApi";

export function useCompaniesModule() {
  const { userId } = useUser();
  const [companies, setCompanies] = React.useState<CompanyEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<CompanyEntity | null>(null);
  const [editDraft, setEditDraft] = React.useState<CompanyEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<CompanyEntity>(() => blankCompany());
  const [createErrors, setCreateErrors] = React.useState({});
  const [editErrors, setEditErrors] = React.useState({});

  const loadCompanies = React.useCallback(async () => {
    try { setLoading(true); setCompanies(await listCompanies(userId)); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load companies"); } finally { setLoading(false); }
  }, [userId]);

  React.useEffect(() => { void loadCompanies(); }, [loadCompanies]);
  React.useEffect(() => { if (createOpen) { setDraft(blankCompany()); setCreateErrors({}); } }, [createOpen]);

  const rows = React.useMemo(() => companies.filter((company) => !search.trim() || `${company.name} ${company.shortName} ${company.localName || ""} ${company.address || ""}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [companies, search]);
  return { userId, companies, loading, search, selected, editDraft, confirmDelete, createOpen, draft, createErrors, editErrors, rows, setCompanies, setSearch, setSelected, setEditDraft, setConfirmDelete, setCreateOpen, setDraft, setCreateErrors, setEditErrors, loadCompanies };
}
