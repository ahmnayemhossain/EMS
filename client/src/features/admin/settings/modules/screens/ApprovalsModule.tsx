import { GitBranch, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";

const approvalPages = [
  {
    title: "Status store",
    description: "Central status list for approval workflows and page-wise usage.",
    to: "/settings/approvals/statusStore",
    icon: GitBranch,
  },
  {
    title: "Page wise status",
    description: "Choose which statuses each page uses and keep their order clean.",
    to: "/settings/approvals/pageWiseStatus",
    icon: GitBranch,
  },
  {
    title: "Role wise status",
    description: "Role-based approval status pages and workflow access.",
    to: "/settings/approvals/roleWiseStatus",
    icon: ShieldCheck,
  },
  {
    title: "User wise status",
    description: "User-based approval status assignment and workflow access.",
    to: "/settings/approvals/userWiseStatus",
    icon: UserRound,
  },
] as const;

export function ApprovalsModule() {
  const navigate = useNavigate();

  return (
    <SectionCard title="Approvals" description="Choose the approval setup page.">
      <div className="grid gap-4 sm:grid-cols-2">
        {approvalPages.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.to}
              type="button"
              className="text-left"
              onClick={() => navigate(item.to)}
            >
              <Card className="h-full rounded-2xl border-amber-500/15 bg-white/95 transition hover:border-amber-400/35 hover:bg-amber-50/40 dark:bg-slate-950/85 dark:hover:bg-amber-500/[0.06]">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                      <div className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <GitBranch className="size-3.5" />
                    Open page
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
