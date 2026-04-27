import * as React from "react";

import { ThemeProvider } from "@/app/providers/theme-provider";
import { DndProvider } from "@/app/providers/DndProvider";
import { Toaster } from "@/app/components/ui/hot-toaster";
import { ReportBoxInboxSync } from "@/app/state/report-box";
import { getAutoTheme, ThemeModeSync } from "@/app/state/theme-mode";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={getAutoTheme()} storageKey="ems-theme">
      <DndProvider>
      <ThemeModeSync />
      <ReportBoxInboxSync />
      {children}
      <Toaster />
      </DndProvider>
    </ThemeProvider>
  );
}
