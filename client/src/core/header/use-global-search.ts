import * as React from "react";
import { useNavigate } from "react-router";

import { usePermissions } from "@/core/app/state/slices/permissions";
import { canAccessPermission } from "@/core/app/state/slices/permissions.helpers";
import { featureNavGroups, settingsNavItem } from '@/core/sidebar/sidebar.config';
import { settingsRouteDefs } from "@/features/admin/settings/config/settings-route-registry";

export function useGlobalSearch() {
  const navigate = useNavigate();
  const { permissionKeys } = usePermissions();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = React.useMemo(() => {
    const featureItems = featureNavGroups.flatMap((group) =>
      group.items
        .filter((item) => canAccessPermission(permissionKeys, item.permission))
        .map((item) => ({ key: item.to, label: item.label, group: group.label, to: item.to })),
    );
    const settingsItems = settingsRouteDefs
      .filter((item) => item.openAs === "page")
      .filter(() => canAccessPermission(permissionKeys, settingsNavItem.permission))
      .map((item) => ({ key: `/settings/${item.segment}`, label: item.title, group: "Settings", to: `/settings/${item.segment}` }));
    if (canAccessPermission(permissionKeys, settingsNavItem.permission)) {
      settingsItems.unshift({ key: settingsNavItem.to, label: settingsNavItem.label, group: "Settings", to: settingsNavItem.to });
    }
    return [...featureItems, ...settingsItems];
  }, [permissionKeys]);

  function run(to: string) {
    setOpen(false);
    navigate(to);
  }

  return { open, setOpen, items, run };
}
