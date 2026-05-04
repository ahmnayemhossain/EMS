export type AppConfig = {
  id: string;
  name: string;
  version: string;
  showVersionBadge?: boolean;
  description: string;
  shell: {
    defaultSidebarOpen: boolean;
    sidebarVariant: "sidebar" | "floating" | "inset";
    maxContentWidth: number;
  };
  design: {
    pattern: string;
    density: "compact" | "comfortable";
    tone: "clean" | "expressive";
  };
};
