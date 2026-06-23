import * as React from "react";

import { DateRangePickerPlaceholder } from "@/components/forms/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { DataTable } from "@/components/table/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import type { TrainingRecord } from "@/core/types/models/ems";

import { getTrainingColumns } from "./columns";
import { TrainingTeamsGrid } from "./TrainingTeamsGrid";

export function TrainingPage() {
  const { companies } = useSelectedCompany();
  const [view, setView] = React.useState<"records" | "teams">("records");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const [audience, setAudience] = React.useState<string | undefined>();
  const [trainingRecords] = React.useState<TrainingRecord[]>([]);

  const columns = React.useMemo(() => getTrainingColumns(companies), [companies]);

  const audienceOptions = React.useMemo(() => {
    const values = new Set(trainingRecords.map((record) => record.audience));
    return Array.from(values)
      .sort()
      .map((label) => ({ value: label, label }));
  }, [trainingRecords]);

  const rows = trainingRecords
    .filter((record) => (facilityId ? record.facilityId === facilityId : true))
    .filter((record) => (audience ? record.audience === audience : true))
    .filter((record) => {
      const normalizedQuery = search.trim().toLowerCase();
      if (!normalizedQuery) return true;
      return record.title.toLowerCase().includes(normalizedQuery) || record.audience.toLowerCase().includes(normalizedQuery);
    });

  return (
    <div className="space-y-6">
      <FilterBar
        left={
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="w-full lg:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search trainings..." />
            </div>
            <SelectFilter
              value={facilityId}
              onChange={setFacilityId}
              placeholder="Company"
              items={companies.map((company) => ({ value: company.id, label: company.name }))}
            />
            <SelectFilter value={audience} onChange={setAudience} placeholder="Team" items={audienceOptions} />
            <DateRangePickerPlaceholder label="Next due" />
          </div>
        }
        onClear={() => {
          setSearch("");
          setFacilityId(undefined);
          setAudience(undefined);
        }}
      />

      <Tabs value={view} onValueChange={(value) => setView(value as typeof view)}>
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:w-auto">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4 space-y-4">
          <DataTable rows={rows} columns={columns} rowKey={(row) => row.id} />
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <TrainingTeamsGrid
            teamOptions={audienceOptions}
            rows={trainingRecords}
            onSelectTeam={(team) => {
              setAudience(team);
              setView("records");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
