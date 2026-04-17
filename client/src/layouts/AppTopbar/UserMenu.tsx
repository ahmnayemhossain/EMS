import { ChevronDown } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useCurrentUser } from "@/app/state/user";
import { formatUserLabel } from "@/data/users";

export function UserMenu() {
  const currentUser = useCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <span className="bg-primary/10 text-primary grid shrink-0 size-8 place-items-center rounded-full text-xs font-semibold leading-none">
            {currentUser?.name?.slice(0, 1).toUpperCase() || "U"}
          </span>
          <span className="hidden text-sm font-medium md:inline">
            {currentUser ? formatUserLabel(currentUser) : "User"}
          </span>
          <ChevronDown className="hidden size-4 md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Preferences</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

