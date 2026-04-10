import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ClipboardList,
  CalendarDays,
  Droplets,
  FileText,
  Gauge,
  LayoutDashboard,
  Leaf,
  LineChart,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
};

export const emsNavGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Audit calendar",
        to: "/audit-calendar",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Utilities", to: "/utilities", icon: Gauge },
      { label: "Chemicals", to: "/chemicals", icon: Leaf },
      { label: "SDS / MSDS", to: "/sds", icon: FileText },
      { label: "Waste", to: "/waste", icon: Sparkles },
      {
        label: "Wastewater / ETP",
        to: "/wastewater",
        icon: Droplets,
      },
    ],
  },
  {
    label: "Assurance",
    items: [
      { label: "Audits", to: "/audits", icon: ShieldCheck },
      { label: "CAPA", to: "/capa", icon: ClipboardList },
      { label: "Reports", to: "/reports", icon: LineChart },
      { label: "Documents", to: "/documents", icon: FileText },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Incidents",
        to: "/incidents",
        icon: TriangleAlert,
      },
      { label: "Training", to: "/training", icon: UsersRound },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];
