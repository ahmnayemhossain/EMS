import { SidebarHeader as SidebarHeaderPrimitive } from '@/components/ui/primitives/sidebar';

import { BrandMark } from '@/core/sidebar/BrandMark';
import { appConfig } from '@/core/platform/app-config';

export function SidebarHeader() {
  return (
    <SidebarHeaderPrimitive className="border-sidebar-border/70 flex min-h-11 flex-row items-center gap-2 border-b px-2 py-3">
      <div className="flex h-8 flex-1 items-center gap-2 rounded-lg px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
        <BrandMark className="size-7 shrink-0 rounded-lg" />
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="inline-flex items-start gap-1.5">
            <div className="text-sm font-semibold leading-none">
              {appConfig.name}
            </div>
            {appConfig.showVersionBadge ? (
              <span className="bg-muted/40 text-muted-foreground relative -top-2 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-xs">
                v{appConfig.version}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </SidebarHeaderPrimitive>
  );
}
