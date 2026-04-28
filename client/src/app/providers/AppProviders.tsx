import * as React from "react";

import { ThemeProvider } from "@/app/providers/theme-provider";
import { DndProvider } from "@/app/providers/DndProvider";
import { Toaster } from "@/app/components/ui/hot-toaster";
import { ReportBoxInboxSync } from "@/app/state/report-box";
import { getAutoTheme, ThemeModeSync } from "@/app/state/theme-mode";
import { PermissionSync } from "@/app/state/permissions";
import { AuthSync } from "@/app/state/auth";
import { CompanySync } from "@/app/state/company";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={getAutoTheme()} storageKey="ems-theme">
      <DndProvider>
        <AuthSync />
        <ThemeModeSync />
        <PermissionSync />
        <CompanySync />
        <ReportBoxInboxSync />
        {children}
        <Toaster />
      </DndProvider>
    </ThemeProvider>
  );
}
