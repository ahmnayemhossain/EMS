import { Building2, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useSelectedCompany } from "@/app/state/company";

export function CompanySwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompanyId, companies, loading, error, setSelectedCompanyId } = useSelectedCompany();

  const selectedCompanyName =
    companies.find((f) => f.id === selectedCompanyId)?.name ??
    (loading ? "Loading companies" : "Select company");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[160px] justify-between gap-2 px-2 md:max-w-none md:px-3"
        >
          <Building2 className="size-4 shrink-0 sm:hidden" />
          <span className="hidden truncate sm:inline">{selectedCompanyName}</span>
          <ChevronDown className="hidden size-4 shrink-0 sm:inline" />
          <span className="sr-only sm:hidden">Switch company</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {error ? (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">{error}</div>
        ) : null}
        {!error && !loading && !companies.length ? (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">No active companies</div>
        ) : null}
        <DropdownMenuRadioGroup
          value={selectedCompanyId}
          onValueChange={(nextId) => {
            if (!nextId) return;
            setSelectedCompanyId(nextId);
            const onCompanyPage = /^\/(companies|facilities)\/[^/]+/.test(
              location.pathname,
            );
            if (onCompanyPage) navigate(`/companies/${nextId}`);
          }}
        >
          {companies.map((f) => (
            <DropdownMenuRadioItem key={f.id} value={f.id}>
              <span className="truncate">{f.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
