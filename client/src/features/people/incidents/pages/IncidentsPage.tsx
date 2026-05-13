import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { DateRangePickerPlaceholder } from "@/components/forms/DateRangePickerPlaceholder";
import { DataTable } from "@/components/table/DataTable";
import { FilterBar } from "@/components/forms/FilterBar";
import { PageHeader } from "@/components/layout/primitives/PageHeader";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { facilities, incidents } from "@/core/data/catalog/mock";
import type { Incident } from "@/core/types/models/ems";

import { getIncidentColumns } from "../config/columns";
import { CreateIncidentDialog } from "../components/CreateIncidentDialog";

export function IncidentsPage() {
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [incidentRows, setIncidentRows] = React.useState<Incident[]>(() => incidents);

  const columns = React.useMemo(() => getIncidentColumns(), []);

  const rowsFiltered = incidentRows
    .filter((i) => (companyId ? i.facilityId === companyId : true))
    .filter((i) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            <TriangleAlert className="mr-2 size-4" />
            Create
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search incidentsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦" />
            </div>
            <SelectFilter
              value={companyId}
              onChange={setCompanyId}
              placeholder="Company"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
            <DateRangePickerPlaceholder label="Date" />
          </div>
        }
        onClear={() => {
          setSearch("");
          setCompanyId(undefined);
        }}
      />

      <DataTable rows={rowsFiltered} columns={columns} rowKey={(r) => r.id} />

      <CreateIncidentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        facilities={facilities}
        onCreate={(incident) => setIncidentRows((r) => [incident, ...r])}
      />
    </div>
  );
}

