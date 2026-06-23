import { appRouteDefs } from "@/core/routes/app-route-registry";

export type AppNavItem = {
  label: string;
  to: string;
  icon: NonNullable<typeof appRouteDefs[number]["icon"]>;
  permission?: string;
  end?: boolean;
};

export type AppNavGroup = {
  label: string;
  items: AppNavItem[];
};

const navGroups = Array.from(
  appRouteDefs
    .filter((item) => item.group && item.icon && item.path !== "settings")
    .reduce((map, item) => {
      const group = item.group!;
      const items = map.get(group) ?? [];
      items.push({ label: item.label, to: `/${item.path.split("/:")[0]}`, icon: item.icon!, permission: item.permission });
      map.set(group, items);
      return map;
    }, new Map<string, AppNavItem[]>()),
).map(([label, items]) => ({ label, items })) as AppNavGroup[];

export const featureNavGroups = navGroups;

export const settingsNavItem: AppNavItem = {
  label: "Settings",
  to: "/settings",
  icon: appRouteDefs.find((item) => item.path === "settings")!.icon!,
  permission: "settings:read",
};
