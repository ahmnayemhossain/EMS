import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={12}
      containerStyle={{ top: 20, right: 20 }}
      toastOptions={{
        duration: 2600,
        style: {
          width: "min(92vw, 360px)",
          minHeight: "unset",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          borderRadius: "18px",
          border: "1px solid color-mix(in oklab, var(--border) 88%, white 12%)",
          background: "color-mix(in oklab, var(--background) 90%, white 10%)",
          color: "var(--foreground)",
          boxShadow: "0 18px 40px color-mix(in oklab, black 16%, transparent)",
          textAlign: "left",
          fontSize: "14px",
          fontWeight: 600,
          backdropFilter: "blur(14px)",
        },
        success: {
          style: {
            border: "1px solid color-mix(in oklab, var(--success-600) 24%, var(--border))",
            background: "linear-gradient(180deg, color-mix(in oklab, var(--success-50) 84%, var(--background)) 0%, color-mix(in oklab, var(--success-50) 64%, var(--background)) 100%)",
            color: "var(--foreground)",
          },
          icon: (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[linear-gradient(180deg,var(--success-50),color-mix(in_oklab,var(--success-50)_72%,white))] text-[var(--success-700)] shadow-sm">
              <CheckCircle2 className="size-4.5" strokeWidth={2.2} />
            </div>
          ),
        },
        error: {
          style: {
            border: "1px solid color-mix(in oklab, var(--critical-600) 24%, var(--border))",
            background: "linear-gradient(180deg, color-mix(in oklab, var(--critical-50) 84%, var(--background)) 0%, color-mix(in oklab, var(--critical-50) 64%, var(--background)) 100%)",
            color: "var(--foreground)",
          },
          icon: (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--critical-600)_24%,var(--border))] bg-[linear-gradient(180deg,var(--critical-50),color-mix(in_oklab,var(--critical-50)_72%,white))] text-[var(--critical-700)] shadow-sm">
              <CircleX className="size-4.5" strokeWidth={2.2} />
            </div>
          ),
        },
        blank: {
          style: {
            border: "1px solid color-mix(in oklab, var(--warning-600) 24%, var(--border))",
            background: "linear-gradient(180deg, color-mix(in oklab, var(--warning-50) 84%, var(--background)) 0%, color-mix(in oklab, var(--warning-50) 64%, var(--background)) 100%)",
            color: "var(--foreground)",
          },
          icon: (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--warning-600)_24%,var(--border))] bg-[linear-gradient(180deg,var(--warning-50),color-mix(in_oklab,var(--warning-50)_72%,white))] text-[var(--warning-700)] shadow-sm">
              <CircleAlert className="size-4.5" strokeWidth={2.2} />
            </div>
          ),
        },
      }}
    />
  );
}
