import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      containerStyle={{
        top: "50%",
        transform: "translateY(-50%)",
      }}
      toastOptions={{
        duration: 2200,
        style: {
          width: "min(92vw, 420px)",
          minHeight: "118px",
          display: "grid",
          justifyItems: "center",
          gap: "12px",
          padding: "20px 22px",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          background: "color-mix(in oklab, var(--background) 94%, transparent)",
          color: "var(--foreground)",
          boxShadow: "0 24px 80px color-mix(in oklab, black 22%, transparent)",
          textAlign: "center",
          fontSize: "15px",
          fontWeight: 600,
          backdropFilter: "blur(10px)",
        },
        success: {
          style: {
            border: "1px solid color-mix(in oklab, var(--success-600) 24%, var(--border))",
            background: "color-mix(in oklab, var(--success-50) 72%, var(--background))",
            color: "var(--foreground)",
          },
          icon: (
            <div className="flex size-12 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[var(--success-50)] text-[var(--success-700)]">
              <CheckCircle2 className="size-5" strokeWidth={2} />
            </div>
          ),
        },
        error: {
          style: {
            border: "1px solid color-mix(in oklab, var(--critical-600) 24%, var(--border))",
            background: "color-mix(in oklab, var(--critical-50) 72%, var(--background))",
            color: "var(--foreground)",
          },
          icon: (
            <div className="flex size-12 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--critical-600)_24%,var(--border))] bg-[var(--critical-50)] text-[var(--critical-700)]">
              <CircleX className="size-5" strokeWidth={2} />
            </div>
          ),
        },
        blank: {
          style: {
            border: "1px solid color-mix(in oklab, var(--warning-600) 24%, var(--border))",
            background: "color-mix(in oklab, var(--warning-50) 72%, var(--background))",
            color: "var(--foreground)",
          },
          icon: (
            <div className="flex size-12 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--warning-600)_24%,var(--border))] bg-[var(--warning-50)] text-[var(--warning-700)]">
              <CircleAlert className="size-5" strokeWidth={2} />
            </div>
          ),
        },
      }}
    />
  );
}
