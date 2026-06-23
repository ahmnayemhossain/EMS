import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import type { ReportBoxReport } from "@/core/types/models/ems";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives/select";

export function ComplaintsFiltersBar({
  complaintSearch,
  onComplaintSearchChange,
  complaintCompanyId,
  onComplaintCompanyIdChange,
  complaintStatus,
  onComplaintStatusChange,
  onClear,
}: {
  complaintSearch: string;
  onComplaintSearchChange: (v: string) => void;
  complaintCompanyId?: string;
  onComplaintCompanyIdChange: (v: string | undefined) => void;
  complaintStatus: ReportBoxReport["status"] | "all";
  onComplaintStatusChange: (v: ReportBoxReport["status"] | "all") => void;
  onClear: () => void;
}) {
  const { companies } = useSelectedCompany();

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
            value={complaintCompanyId}
            onChange={onComplaintCompanyIdChange}
            placeholder="Company"
            items={companies.map((company) => ({ value: company.id, label: company.name }))}
          />
          <Select value={complaintStatus} onValueChange={(value) => onComplaintStatusChange(value as ReportBoxReport["status"] | "all")}>
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
