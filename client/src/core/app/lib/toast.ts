import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import hotToast from "react-hot-toast";

export const toast = Object.assign(
  (message: string) => hotToast(message),
  {
    success: (message: string) => hotToast.success(message),
    successDetail: (title: string, description?: string) =>
      hotToast.custom(
        () =>
          React.createElement(
            "div",
            {
              className:
                "w-[min(92vw,420px)] rounded-[20px] border border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[color-mix(in_oklab,var(--success-50)_72%,var(--background))] p-5 text-center text-foreground shadow-[0_24px_80px_color-mix(in_oklab,black_22%,transparent)] backdrop-blur",
            },
            React.createElement(
              "div",
              { className: "grid justify-items-center gap-3" },
              React.createElement(
                "div",
                {
                  className:
                    "flex size-12 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[var(--success-50)] text-[var(--success-700)]",
                },
                React.createElement(CheckCircle2, { className: "size-5", strokeWidth: 2 }),
              ),
              React.createElement("div", { className: "text-[15px] font-semibold" }, title),
              description
                ? React.createElement(
                    "div",
                    { className: "text-muted-foreground text-sm leading-6" },
                    description,
                  )
                : null,
            ),
          ),
        { duration: 2600 },
      ),
    error: (message: string) => hotToast.error(message),
    message: (message: string) => hotToast(message),
    dismiss: hotToast.dismiss,
  },
);
