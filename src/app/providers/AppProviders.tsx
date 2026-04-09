import * as React from "react";

import { ThemeProvider } from "@/app/providers/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";
import { FactoryProvider } from "@/app/state/factory";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ems-theme">
      <FactoryProvider>{children}</FactoryProvider>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
