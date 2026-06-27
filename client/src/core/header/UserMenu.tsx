import * as React from "react";
import { ChevronDown, KeyRound, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { useAuth } from "@/core/app/state/slices/auth";
import { useCurrentUser } from "@/core/app/state/slices/user";
import { formatUserLabel } from "@/core/users/format-user-label";
import { ChangePasswordDialog } from "@/core/header/ChangePasswordDialog";

export function UserMenu() {
  const currentUser = useCurrentUser();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  return (
    <>
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
          <DropdownMenuItem onSelect={() => setPasswordDialogOpen(true)}>
            <KeyRound className="size-4" />
            Change password
          </DropdownMenuItem>
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
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </>
  );
}

