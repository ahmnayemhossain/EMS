import * as React from "react";
import { Outlet } from "react-router";
import { Leaf } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import { Separator } from "@/app/components/ui/separator";
import { AppTopbar } from "@/layouts/AppTopbar";
import { Breadcrumbs } from "@/layouts/Breadcrumbs";
import { emsNavGroups } from "@/layouts/nav";
import { SidebarNavLink } from "@/layouts/SidebarNavLink";

export function AppShell() {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="gap-2">
          <div className="flex items-center gap-2 px-2 pt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
            <div className="bg-primary text-primary-foreground grid shrink-0 size-8 place-items-center rounded-lg shadow-sm">
              <Leaf className="size-4" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <div className="text-sm font-semibold leading-none">
                Fortis Group EMS
              </div>
            </div>
          </div>
          <Separator />
        </SidebarHeader>

        <SidebarContent>
          {emsNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarNavLink
                        to={item.to}
                        end={item.end}
                        icon={item.icon}
                        label={item.label}
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="h-svh overflow-hidden [--sidebar-current-width:var(--sidebar-width)] peer-data-[state=collapsed]:[--sidebar-current-width:var(--sidebar-width-icon)]">
        <div className="hidden md:block">
          <SidebarTrigger
            className={
              "fixed top-14 z-[90] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-zinc-200 text-zinc-800 shadow-sm hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700 " +
              "left-[var(--sidebar-current-width)]"
            }
          />
        </div>
        <AppTopbar />
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Breadcrumbs />
            </div>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
