import type { ComponentType } from "react";

import type { LazyModuleLoader } from "@/core/routes/route.types";

export function lazyPage(load: LazyModuleLoader, exportName: string) {
  return async () => {
    const mod = await load();
    return { Component: mod[exportName] as ComponentType };
  };
}
