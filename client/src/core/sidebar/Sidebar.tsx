import { Sidebar as SidebarPrimitive, SidebarRail } from '@/components/ui/primitives/sidebar';

import { appConfig } from '@/core/platform/app-config';
import { SidebarFooter } from '@/core/sidebar/SidebarFooter';
import { SidebarHeader } from '@/core/sidebar/SidebarHeader';
import { SidebarNav } from '@/core/sidebar/SidebarNav';

export function Sidebar() {
  return (
    <SidebarPrimitive
      collapsible="icon"
      variant={appConfig.shell.sidebarVariant}
      className="border-sidebar-border/70"
    >
      <SidebarHeader />
      <SidebarNav />
      <SidebarFooter />
      <SidebarRail />
    </SidebarPrimitive>
  );
}
