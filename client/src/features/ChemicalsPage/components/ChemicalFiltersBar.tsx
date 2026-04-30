import * as React from "react";

import { Input } from "@/core/app/components/ui/input";
import { DateRangePickerPlaceholder } from "@/core/components/DateRangePickerPlaceholder";
import { FilterBar } from "@/core/components/FilterBar";
import { SearchInput } from "@/core/components/SearchInput";
import { SelectFilter } from "@/core/components/SelectFilter";
import type { Facility } from "@/core/types/ems";

import { chemicalApprovalOptions, hazardLabels } from "../constants";

export function ChemicalFiltersBar({
  facilities,
  search,
  onSearchChange,
  companyId,
  onCompanyIdChange,
  hazard,
  onHazardChange,
  approval,
  onApprovalChange,
  expiryFrom,
  onExpiryFromChange,
  expiryTo,
  onExpiryToChange,
  onClear,
}: {
  facilities: Facility[];
  search: string;
  onSearchChange: (v: string) => void;
  companyId?: string;
  onCompanyIdChange: (v: string | undefined) => void;
  hazard?: string;
  onHazardChange: (v: string | undefined) => void;
  approval?: string;
  onApprovalChange: (v: string | undefined) => void;
  expiryFrom: string;
  onExpiryFromChange: (v: string) => void;
  expiryTo: string;
  onExpiryToChange: (v: string) => void;
  onClear: () => void;
}) {
  const hazardOptions = Object.entries(hazardLabels).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <FilterBar
      left={
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="w-full lg:w-[320px]">
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search chemical / supplier…" />
          </div>
          <SelectFilter
            value={companyId}
            onChange={onCompanyIdChange}
            placeholder="Company"
            items={facilities.map((f) => ({ value: f.id, label: f.name }))}
          />
          <SelectFilter
            value={hazard}
            onChange={onHazardChange}
            placeholder="Hazard"
            items={hazardOptions}
          />
          <SelectFilter
            value={approval}
            onChange={onApprovalChange}
            placeholder="Approval"
            items={chemicalApprovalOptions}
          />
          <div className="grid w-full grid-cols-2 gap-2 lg:w-auto">
            <Input type="date" value={expiryFrom} onChange={(e) => onExpiryFromChange(e.target.value)} />
            <Input type="date" value={expiryTo} onChange={(e) => onExpiryToChange(e.target.value)} />
          </div>
          <DateRangePickerPlaceholder label="Expiry" />
        </div>
      }
      onClear={onClear}
    />
  );
}

