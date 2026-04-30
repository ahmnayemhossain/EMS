import type { LucideIcon } from "lucide-react";

export type LazyModuleLoader = () => Promise<Record<string, unknown>>;

export type AppRouteDef = {
  path: string;
  segment: string;
  label: string;
  group?: string;
  permission?: string;
  icon?: LucideIcon;
  exportName?: string;
  load?: LazyModuleLoader;
};

export type PublicRouteDef = {
  path: string;
  segment: string;
  label: string;
  exportName: string;
  load: LazyModuleLoader;
};
