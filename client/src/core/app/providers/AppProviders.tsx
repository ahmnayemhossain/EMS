import * as React from "react";

import { ThemeProvider } from "@/core/app/providers/theme-provider";
import { Toaster } from "@/components/ui/primitives/hot-toaster";
import { getAutoTheme, ThemeModeSync } from "@/core/app/state/slices/theme-mode";
import { PermissionSync } from "@/core/app/state/slices/permissions";
import { AuthSync } from "@/core/app/state/slices/auth";
import { CompanySync } from "@/core/app/state/slices/company";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={getAutoTheme()} storageKey="ems-theme">
      <AuthSync />
      <ThemeModeSync />
      <PermissionSync />
      <CompanySync />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}

