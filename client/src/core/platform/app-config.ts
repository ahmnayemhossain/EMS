import type { AppConfig } from "@/core/platform/platform.types";

export const appConfig: AppConfig = {
  id: "fortis-ems",
  name: "Fortis Group EMS",
  version: "1.0.0",
  showVersionBadge: false,
  description: "Compliance, operations, reporting, and workforce workflows in one workspace.",
  shell: {
    defaultSidebarOpen: false,
    sidebarVariant: "floating",
    maxContentWidth: 1680,
  },
  design: {
    pattern: "clickup-inspired work app",
    density: "compact",
    tone: "clean",
  },
};
