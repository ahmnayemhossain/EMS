import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/core/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/app/components/ui/dropdown-menu";
import { useAuth } from "@/core/app/state/auth";
import { useCurrentUser } from "@/core/app/state/user";
import { formatUserLabel } from "@/core/data/users";

export function UserMenu() {
  const currentUser = useCurrentUser();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

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
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full">
              <UserRound className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {currentUser ? formatUserLabel(currentUser) : "User"}
              </span>
              {user?.email ? (
                <span className="text-muted-foreground block truncate text-xs font-normal">
                  {user.email}
                </span>
              ) : null}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onSelect={() => void handleSignOut()}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
