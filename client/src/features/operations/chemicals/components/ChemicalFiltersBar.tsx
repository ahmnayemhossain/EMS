import * as React from "react";

import { Input } from "@/components/ui/primitives/input";
import { DateRangePickerPlaceholder } from "@/components/forms/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import type { CompanyOption } from "@/core/app/state/slices/company";

import { chemicalApprovalOptions, hazardLabels } from "../config/constants";

export function ChemicalFiltersBar({
  companies,
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
  companies: CompanyOption[];
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
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search chemical / supplier..." />
          </div>
          <SelectFilter
            value={companyId}
            onChange={onCompanyIdChange}
            placeholder="Company"
            items={companies.map((c) => ({ value: c.id, label: c.name }))}
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

