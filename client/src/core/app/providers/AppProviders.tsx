import * as React from "react";

import { ThemeProvider } from "@/core/app/providers/theme-provider";
import { DndProvider } from "@/core/app/providers/DndProvider";
import { Toaster } from "@/components/ui/primitives/hot-toaster";
import { ReportBoxInboxSync } from "@/core/app/state/slices/report-box";
import { getAutoTheme, ThemeModeSync } from "@/core/app/state/slices/theme-mode";
import { PermissionSync } from "@/core/app/state/slices/permissions";
import { AuthSync } from "@/core/app/state/slices/auth";
import { CompanySync } from "@/core/app/state/slices/company";

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

