import * as React from "react";

import { ThemeProvider } from "@/core/app/providers/theme-provider";
import { DndProvider } from "@/core/app/providers/DndProvider";
import { Toaster } from "@/core/app/components/ui/hot-toaster";
import { ReportBoxInboxSync } from "@/core/app/state/report-box";
import { getAutoTheme, ThemeModeSync } from "@/core/app/state/theme-mode";
import { PermissionSync } from "@/core/app/state/permissions";
import { AuthSync } from "@/core/app/state/auth";
import { CompanySync } from "@/core/app/state/company";

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
