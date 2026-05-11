import { appRouteDefs } from "@/core/routes/app-route-registry";
import { publicRouteDefs } from "@/core/routes/public-route-registry";
import { settingsRouteDefs } from "@/features/admin/settings/config/settings-route-registry";

export const routeLabels = Object.fromEntries([
  ...appRouteDefs.map((item) => [item.segment, item.label]),
  ...publicRouteDefs.map((item) => [item.segment, item.label]),
  ...settingsRouteDefs.map((item) => [item.segment, item.title]),
]) as Record<string, string>;
