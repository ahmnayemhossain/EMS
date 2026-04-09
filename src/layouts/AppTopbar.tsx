import * as React from "react";
import { Bell, ChevronDown, Laptop, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocation, useNavigate } from "react-router";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/app/components/ui/sidebar";
import { facilities } from "@/data/mock";
import { useSelectedFactory } from "@/app/state/factory";

export function AppTopbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { selectedFactoryId, setSelectedFactoryId } = useSelectedFactory();
  const selectedFactoryName =
    facilities.find((f) => f.id === selectedFactoryId)?.name ?? "Select factory";

  return (
    <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-3 px-4 md:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-[520px] flex-1">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
            <Input
              className="pl-9"
              placeholder="Search factories, audits, chemicals..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden md:inline-flex">
                {selectedFactoryName}
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch factory</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedFactoryId}
                onValueChange={(nextId) => {
                  setSelectedFactoryId(nextId);

                  // If user is already on a factory page, swap the id. Otherwise navigate to a factory dashboard.
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Theme">
                {resolvedTheme === "dark" ? (
                  <Moon className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={theme ?? "system"}
                onValueChange={(v) => setTheme(v)}
              >
                <DropdownMenuRadioItem value="light">
                  <Sun className="size-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="size-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Laptop className="size-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <span className="bg-primary/10 text-primary grid shrink-0 size-8 place-items-center rounded-full text-xs font-semibold leading-none">
                  N
                </span>
                <span className="hidden text-sm font-medium md:inline">
                  Nayem (700901)
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
        </div>
      </div>
    </header>
  );
}
