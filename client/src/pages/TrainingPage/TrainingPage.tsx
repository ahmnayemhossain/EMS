import * as React from "react";
import { GraduationCap } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/FilterBar";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { facilities, trainingRecords } from "@/data/mock";

import { getTrainingColumns } from "./columns";
import { TrainingTeamsGrid } from "./TrainingTeamsGrid";

export function TrainingPage() {
  const [view, setView] = React.useState<"records" | "teams">("records");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const [audience, setAudience] = React.useState<string | undefined>();

  const columns = React.useMemo(() => getTrainingColumns(), []);

  const audienceOptions = React.useMemo(() => {
    const set = new Set(trainingRecords.map((t) => t.audience));
    return Array.from(set).sort().map((a) => ({ value: a, label: a }));
  }, []);

  const rows = trainingRecords
    .filter((t) => (facilityId ? t.facilityId === facilityId : true))
    .filter((t) => (audience ? t.audience === audience : true))
    .filter((t) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.audience.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button variant="outline">
            <GraduationCap className="mr-2 size-4" />
            Add training
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="w-full lg:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search trainings…" />
            </div>
            <SelectFilter
              value={facilityId}
              onChange={setFacilityId}
              placeholder="Factory"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
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

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:w-auto">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4 space-y-4">
          <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} />
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
