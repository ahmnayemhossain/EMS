import * as React from "react";

import { ThemeProvider } from "@/app/providers/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";
import { FactoryProvider } from "@/app/state/factory";
import { getAutoTheme, ThemeModeProvider } from "@/app/state/theme-mode";
import { NotificationsProvider } from "@/app/state/notifications";
import { ReportBoxProvider } from "@/app/state/report-box";
import { UserProvider } from "@/app/state/user";
import { AdminProvider } from "@/app/state/admin";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={getAutoTheme()} storageKey="ems-theme">
      <ThemeModeProvider>
        <UserProvider>
          <NotificationsProvider>
            <AdminProvider>
              <ReportBoxProvider>
                <FactoryProvider>{children}</FactoryProvider>
              </ReportBoxProvider>
            </AdminProvider>
          </NotificationsProvider>
        </UserProvider>
        <Toaster richColors closeButton />
      </ThemeModeProvider>
    </ThemeProvider>
  );
}
