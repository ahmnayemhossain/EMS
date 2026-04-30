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
          minHeight: "132px",
          display: "grid",
          justifyItems: "center",
          gap: "10px",
          padding: "22px 24px",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          background: "var(--background)",
          color: "var(--foreground)",
          boxShadow: "0 24px 80px color-mix(in oklab, black 22%, transparent)",
          textAlign: "center",
          fontSize: "15px",
          fontWeight: 600,
        },
        success: {
          icon: <CheckCircle2 className="size-12 text-[var(--success-600)]" strokeWidth={1.8} />,
        },
        error: {
          icon: <CircleX className="size-12 text-destructive" strokeWidth={1.8} />,
        },
        blank: {
          icon: <CircleAlert className="size-12 text-[var(--warning-600)]" strokeWidth={1.8} />,
        },
      }}
    />
  );
}
