import * as React from "react";

import { DateRangePickerPlaceholder } from "@/components/forms/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { DataTable } from "@/components/table/DataTable";
import { FloatingCreateButton } from "@/components/layout/primitives/FloatingCreateButton";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import type { Incident } from "@/core/types/models/ems";

import { CreateIncidentDialog } from "../components/CreateIncidentDialog";
import { getIncidentColumns } from "../config/columns";

export function IncidentsPage() {
  const { companies } = useSelectedCompany();
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [incidentRows, setIncidentRows] = React.useState<Incident[]>([]);

  const columns = React.useMemo(() => getIncidentColumns(companies), [companies]);

  const rowsFiltered = incidentRows
    .filter((incident) => (companyId ? incident.facilityId === companyId : true))
    .filter((incident) => {
      const normalizedQuery = search.trim().toLowerCase();
      if (!normalizedQuery) return true;
      return incident.title.toLowerCase().includes(normalizedQuery) || incident.type.toLowerCase().includes(normalizedQuery) || incident.status.toLowerCase().includes(normalizedQuery);
    });

  return (
    <div className="space-y-6">
      <FloatingCreateButton label="Create incident" onClick={() => setCreateOpen(true)} />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
            </div>
            <SelectFilter
              value={companyId}
              onChange={setCompanyId}
              placeholder="Company"
              items={companies.map((company) => ({ value: company.id, label: company.name }))}
            />
            <DateRangePickerPlaceholder label="Date" />
          </div>
        }
        onClear={() => {
          setSearch("");
          setCompanyId(undefined);
        }}
      />

      <DataTable rows={rowsFiltered} columns={columns} rowKey={(row) => row.id} />

      <CreateIncidentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        companies={companies}
        onCreate={(incident) => setIncidentRows((current) => [incident, ...current])}
      />
    </div>
  );
}
