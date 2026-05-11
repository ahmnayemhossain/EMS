import * as React from 'react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/primitives/sidebar';
import { canAccessPermission } from '@/core/app/state/slices/permissions.helpers';
import { usePermissions } from '@/core/app/state/slices/permissions';
import { AppSidebarMoreMenu } from '@/core/sidebar/AppSidebarMoreMenu';
import { featureNavGroups } from '@/core/sidebar/sidebar.config';
import { SidebarItem } from '@/core/sidebar/SidebarItem';

export function SidebarNav() {
  const { permissionKeys } = usePermissions();
  const { state } = useSidebar();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const allowedGroups = React.useMemo(
    () =>
      featureNavGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            canAccessPermission(permissionKeys, item.permission),
          ),
        }))
        .filter((group) => group.items.length),
    [permissionKeys],
  );
  const allowedItems = React.useMemo(
    () => allowedGroups.flatMap((group) => group.items),
    [allowedGroups],
  );
  const visibleCount = useCollapsedVisibleCount(
    contentRef,
    allowedItems.length,
    state === 'collapsed',
  );
  const visibleKeys = new Set(
    allowedItems.slice(0, visibleCount).map((item) => item.to),
  );
  const hiddenItems =
    state === 'collapsed' ? allowedItems.slice(visibleCount) : [];

  return (
    <SidebarContent
      ref={contentRef}
      className="min-h-0 px-2 pb-2 group-data-[collapsible=icon]:pt-1"
    >
      {state === 'collapsed' ? (
        <SidebarMenu>
          {allowedItems
            .filter((item) => visibleKeys.has(item.to))
            .map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarItem
                  to={item.to}
                  end={item.end}
                  icon={item.icon}
                  label={item.label}
                  permission={item.permission}
                />
              </SidebarMenuItem>
            ))}
          {hiddenItems.length ? (
            <SidebarMenuItem>
              <AppSidebarMoreMenu items={hiddenItems} />
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      ) : (
        <>
          {allowedGroups.map((group) => {
            const items = group.items.filter((item) =>
              visibleKeys.has(item.to),
            );
            if (!items.length) return null;
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarItem
                          to={item.to}
                          end={item.end}
                          icon={item.icon}
                          label={item.label}
                          permission={item.permission}
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </>
      )}
    </SidebarContent>
  );
}

function useCollapsedVisibleCount(
  ref: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
  collapsed: boolean,
) {
  const [visibleCount, setVisibleCount] = React.useState(itemCount);

  React.useEffect(() => {
    if (!collapsed) {
      setVisibleCount(itemCount);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const update = () => {
      const height = element.clientHeight;
      const rowHeight = 40;
      const slots = Math.max(0, Math.floor((height + 4) / rowHeight));
      const needsMore = itemCount > slots;
      setVisibleCount(needsMore ? Math.max(0, slots - 1) : itemCount);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [collapsed, itemCount, ref]);

  return visibleCount;
}
