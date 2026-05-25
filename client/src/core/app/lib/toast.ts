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
                "flex w-[min(92vw,360px)] items-start gap-3 rounded-[18px] border border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--success-50)_84%,var(--background))_0%,color-mix(in_oklab,var(--success-50)_64%,var(--background))_100%)] p-4 text-left text-foreground shadow-[0_18px_40px_color-mix(in_oklab,black_16%,transparent)] backdrop-blur",
            },
            React.createElement(
              "div",
              { className: "contents" },
              React.createElement(
                "div",
                {
                  className:
                    "flex size-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[linear-gradient(180deg,var(--success-50),color-mix(in_oklab,var(--success-50)_72%,white))] text-[var(--success-700)] shadow-sm",
                },
                React.createElement(CheckCircle2, { className: "size-[18px]", strokeWidth: 2.2 }),
              ),
              React.createElement(
                "div",
                { className: "min-w-0" },
                React.createElement("div", { className: "text-[14px] font-semibold leading-5" }, title),
                description
                  ? React.createElement(
                      "div",
                      { className: "text-muted-foreground mt-1 text-[13px] leading-5" },
                      description,
                    )
                  : null,
              ),
            ),
          ),
        { duration: 2800 },
      ),
    error: (message: string) => hotToast.error(message),
    message: (message: string) => hotToast(message),
    dismiss: hotToast.dismiss,
  },
);
