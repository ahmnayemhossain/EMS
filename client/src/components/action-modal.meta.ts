import { AlertTriangle, CheckCircle2, HelpCircle, Trash2 } from "lucide-react";

export type ActionModalTone = "default" | "destructive" | "warning" | "success";

export const toneMeta = {
  default: {
    icon: HelpCircle,
    iconClass: "border-primary/20 bg-primary/10 text-primary",
    actionVariant: "default" as const,
  },
  destructive: {
    icon: Trash2,
    iconClass: "border-destructive/20 bg-destructive/10 text-destructive",
    actionVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "border-[color-mix(in_oklab,var(--warning-600)_24%,var(--border))] bg-[var(--warning-50)] text-[var(--warning-700)]",
    actionVariant: "default" as const,
  },
  success: {
    icon: CheckCircle2,
    iconClass: "border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[var(--success-50)] text-[var(--success-700)]",
    actionVariant: "default" as const,
  },
};
