import {
  SidebarFooter as SidebarFooterPrimitive,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/primitives/sidebar';

import { SidebarItem } from '@/core/sidebar/SidebarItem';
import { settingsNavItem } from '@/core/sidebar/sidebar.config';

export function SidebarFooter() {
  return (
    <SidebarFooterPrimitive className="border-sidebar-border/80 mt-auto border-t px-2 py-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarItem
            to={settingsNavItem.to}
            icon={settingsNavItem.icon}
            label={settingsNavItem.label}
            permission={settingsNavItem.permission}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooterPrimitive>
  );
}
