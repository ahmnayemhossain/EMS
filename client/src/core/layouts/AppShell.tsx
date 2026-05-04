import * as React from "react";
import { Outlet } from "react-router";

import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/core/app/components/ui/sidebar";
import { Separator } from "@/core/app/components/ui/separator";
import { AppSidebarNavigation } from "@/core/layouts/AppSidebarNavigation";
import { AppTopbar } from "@/core/layouts/AppTopbar";
import { BrandMark } from "@/core/layouts/BrandMark";
import { Breadcrumbs } from "@/core/layouts/Breadcrumbs";
import { appConfig } from "@/core/platform/app-config";

export function AppShell() {
  return (
    <SidebarProvider defaultOpen={appConfig.shell.defaultSidebarOpen}>
      <Sidebar
        collapsible="icon"
        variant={appConfig.shell.sidebarVariant}
        className="border-sidebar-border/70"
      >
        <SidebarHeader className="gap-2 px-2 pt-2">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
            <BrandMark className="size-7 shrink-0 rounded-lg" />
            <div className="group-data-[collapsible=icon]:hidden">
              <div className="inline-flex items-start gap-1.5">
                <div className="text-sm font-semibold leading-none">{appConfig.name}</div>
                {appConfig.showVersionBadge ? (
                  <span className="bg-muted/40 text-muted-foreground relative -top-2 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-xs">
                    v{appConfig.version}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <Separator />
        </SidebarHeader>
        <AppSidebarNavigation />
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="h-svh min-h-svh overflow-hidden bg-background pt-1 [--sidebar-current-width:var(--sidebar-width)] peer-data-[state=collapsed]:[--sidebar-current-width:var(--sidebar-width-icon)]">
        <div
          data-slot="app-canvas-scroll"
          className="flex min-h-0 flex-1 flex-col overflow-auto"
        >
          <AppTopbar />
          <div
            className="mx-auto w-full px-4 py-5 md:px-6"
            style={{ maxWidth: `${appConfig.shell.maxContentWidth}px` }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <Breadcrumbs />
            </div>
            <Outlet />
          </div>
          <div aria-hidden className="h-2 shrink-0" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
