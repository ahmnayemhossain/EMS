import * as React from "react";
import {
  Building2,
  Factory,
  Gauge,
  Mail,
  MessagesSquare,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  UserRound,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import { DetailPanel } from "@/components/DetailPanel";

import { PlaceholderModule } from "@/pages/settings/modules/PlaceholderModule";

type SettingsTab = "system" | "operations" | "compliance" | "communications";

type SettingsCardKey =
  | "employees"
  | "users"
  | "roles"
  | "departments"
  | "designations"
  | "uom"
  | "suppliers"
  | "factories"
  | "email"
  | "complaint_box"
  | "thresholds"
  | "approvals";

type SettingsCardDef = {
  key: SettingsCardKey;
  tab: SettingsTab;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  openAs: "page" | "drawer";
  to?: string;
};

const cards: SettingsCardDef[] = [
  // System (big -> page)
  {
    key: "employees",
    tab: "system",
    title: "Employees",
    description: "Employee directory (ownership, assignees, handlers).",
    icon: UsersRound,
    openAs: "page",
    to: "/settings/employees",
  },
  {
    key: "users",
    tab: "system",
    title: "Users",
    description: "Application accounts, login identity, status.",
    icon: UserRound,
    openAs: "page",
    to: "/settings/users",
  },
  {
    key: "roles",
    tab: "system",
    title: "Roles",
    description: "Permissions by role and scope (group / factory).",
    icon: ShieldCheck,
    openAs: "page",
    to: "/settings/roles",
  },
  // System (scaffolded but still big -> page later)
  {
    key: "departments",
    tab: "system",
    title: "Departments",
    description: "Standardize departments used across the app.",
    icon: Building2,
    openAs: "page",
    to: "/settings/departments",
  },
  {
    key: "designations",
    tab: "system",
    title: "Designations",
    description: "Standardize job titles (Supervisor, Officer, etc.).",
    icon: Wrench,
    openAs: "page",
    to: "/settings/designations",
  },

  // Operations (big -> page later)
  {
    key: "factories",
    tab: "operations",
    title: "Factories",
    description: "Manage factories (name, code, type, location, risk).",
    icon: Factory,
    openAs: "page",
    to: "/settings/factories",
  },
  {
    key: "uom",
    tab: "operations",
    title: "Units (UOM)",
    description: "kWh, m\u00B3, kg, Nm\u00B3... unified units across utilities.",
    icon: Ruler,
    openAs: "page",
    to: "/settings/uom",
  },
  {
    key: "suppliers",
    tab: "operations",
    title: "Suppliers",
    description: "Suppliers for chemicals, waste vendors, labs.",
    icon: Gauge,
    openAs: "page",
    to: "/settings/suppliers",
  },

  // Compliance (small -> drawer for now)
  {
    key: "thresholds",
    tab: "compliance",
    title: "Thresholds",
    description: "Wastewater and utilities thresholds for alerts.",
    icon: SlidersHorizontal,
    openAs: "drawer",
  },
  {
    key: "approvals",
    tab: "compliance",
    title: "Approvals",
    description: "Restricted list, SDS completeness rules, approvals.",
    icon: ShieldCheck,
    openAs: "drawer",
  },

  // Communications (small -> drawer for now)
  {
    key: "email",
    tab: "communications",
    title: "Email setup",
    description: "SMTP / sender identity for system notifications.",
    icon: Mail,
    openAs: "drawer",
  },
  {
    key: "complaint_box",
    tab: "communications",
    title: "Complaint box",
    description: "Public URL behavior, routing, retention, rules.",
    icon: MessagesSquare,
    openAs: "drawer",
  },
];

function SettingsLauncherCard({
  def,
  onOpenDrawer,
}: {
  def: SettingsCardDef;
  onOpenDrawer: (key: SettingsCardKey) => void;
}) {
  const navigate = useNavigate();
  const Icon = def.icon;
  return (
    <button
      type="button"
      className="text-left"
      onClick={() => {
        if (def.openAs === "page" && def.to) return navigate(def.to);
        onOpenDrawer(def.key);
      }}
    >
      <Card className="hover:bg-muted/10 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="bg-muted/20 text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl border">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold">{def.title}</CardTitle>
              <div className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {def.description}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-muted-foreground text-xs">
            {def.openAs === "page" ? "Open page" : "Quick view"}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function renderDrawerModule(key: SettingsCardKey) {
  switch (key) {
    case "thresholds":
      return (
        <PlaceholderModule
          title="Thresholds"
          description="Threshold rules to drive alerts and compliance scoring."
        />
      );
    case "approvals":
      return (
        <PlaceholderModule
          title="Approvals"
          description="Restricted list + SDS requirements + approval workflow settings."
        />
      );
    case "email":
      return (
        <PlaceholderModule
          title="Email setup"
          description="SMTP settings, sender, and email templates (placeholder)."
        />
      );
    case "complaint_box":
      return (
        <PlaceholderModule
          title="Complaint box settings"
          description="Public URL behavior, retention policy, and moderation workflow."
        />
      );
    default:
      return null;
  }
}

export function SettingsHomePage() {
  const [tab, setTab] = React.useState<SettingsTab>("system");
  const [drawerKey, setDrawerKey] = React.useState<SettingsCardKey | null>(null);

  const openDef = drawerKey ? cards.find((c) => c.key === drawerKey) : null;

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as SettingsTab)} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        {(["system", "operations", "compliance", "communications"] as const).map((t) => (
          <TabsContent key={t} value={t} className="m-0">
            <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3")}>
              {cards
                .filter((c) => c.tab === t)
                .map((c) => (
                  <SettingsLauncherCard
                    key={c.key}
                    def={c}
                    onOpenDrawer={(k) => setDrawerKey(k)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <DetailPanel
        open={Boolean(drawerKey)}
        onOpenChange={(o) => (!o ? setDrawerKey(null) : null)}
        title={openDef?.title || "Settings"}
        description={openDef?.description}
      >
        {drawerKey ? renderDrawerModule(drawerKey) : null}
      </DetailPanel>
    </div>
  );
}
