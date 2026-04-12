import * as React from "react";

import { ThemeProvider } from "@/app/providers/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";
import { FactoryProvider } from "@/app/state/factory";
import { getAutoTheme, ThemeModeProvider } from "@/app/state/theme-mode";
import { NotificationsProvider } from "@/app/state/notifications";
import { ReportBoxProvider } from "@/app/state/report-box";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={getAutoTheme()} storageKey="ems-theme">
      <ThemeModeProvider>
        <NotificationsProvider>
          <ReportBoxProvider>
            <FactoryProvider>{children}</FactoryProvider>
          </ReportBoxProvider>
        </NotificationsProvider>
        <Toaster richColors closeButton />
      </ThemeModeProvider>
    </ThemeProvider>
  );
}
