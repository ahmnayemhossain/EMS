import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { facilities } from "@/data/mock";
import type { ReportBoxReport } from "@/types/ems";

export function ComplaintsFiltersBar({
  complaintSearch,
  onComplaintSearchChange,
  complaintFactoryId,
  onComplaintFactoryIdChange,
  complaintStatus,
  onComplaintStatusChange,
  onClear,
}: {
  complaintSearch: string;
  onComplaintSearchChange: (v: string) => void;
  complaintFactoryId?: string;
  onComplaintFactoryIdChange: (v: string | undefined) => void;
  complaintStatus: ReportBoxReport["status"] | "all";
  onComplaintStatusChange: (v: ReportBoxReport["status"] | "all") => void;
  onClear: () => void;
}) {
  return (
    <FilterBar
      left={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              value={complaintSearch}
              onChange={onComplaintSearchChange}
              placeholder="Search complaints..."
            />
          </div>
          <SelectFilter
            value={complaintFactoryId}
            onChange={onComplaintFactoryIdChange}
            placeholder="Factory"
            items={facilities.map((f) => ({ value: f.id, label: f.name }))}
          />
          <Select value={complaintStatus} onValueChange={(v) => onComplaintStatusChange(v as any)}>
            <SelectTrigger className="h-10 w-full sm:w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">new</SelectItem>
              <SelectItem value="triaged">triaged</SelectItem>
              <SelectItem value="handled">handled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      onClear={onClear}
    />
  );
}

