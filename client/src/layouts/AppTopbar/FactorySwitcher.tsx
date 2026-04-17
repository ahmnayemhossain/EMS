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
import { facilities } from "@/data/mock";
import { useSelectedFactory } from "@/app/state/factory";

export function FactorySwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFactoryId, setSelectedFactoryId } = useSelectedFactory();

  const selectedFactoryName =
    facilities.find((f) => f.id === selectedFactoryId)?.name ?? "Select factory";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[160px] justify-between gap-2 px-2 md:max-w-none md:px-3"
        >
          <Building2 className="size-4 shrink-0 sm:hidden" />
          <span className="hidden truncate sm:inline">{selectedFactoryName}</span>
          <ChevronDown className="hidden size-4 shrink-0 sm:inline" />
          <span className="sr-only sm:hidden">Switch factory</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch factory</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedFactoryId}
          onValueChange={(nextId) => {
            setSelectedFactoryId(nextId);
            const onFactoryPage = /^\/(factories|facilities)\/[^/]+/.test(
              location.pathname,
            );
            navigate(onFactoryPage ? `/factories/${nextId}` : `/factories/${nextId}`);
          }}
        >
          {facilities.map((f) => (
            <DropdownMenuRadioItem key={f.id} value={f.id}>
              {f.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
