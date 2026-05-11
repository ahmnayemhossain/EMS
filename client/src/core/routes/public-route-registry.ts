import type { PublicRouteDef } from "@/core/routes/route.types";

export const publicRouteDefs: PublicRouteDef[] = [
  { path: "/sign-in", segment: "sign-in", label: "Sign in", exportName: "SignInPage", load: () => import("@/features/auth/sign-in/pages/SignInPage") },
  { path: "/rb/:code", segment: "rb", label: "Report box", exportName: "PublicReportBoxPage", load: () => import("@/features/public/report-box") },
  { path: "rb/:code", segment: "rb", label: "Report box", exportName: "PublicReportBoxPage", load: () => import("@/features/public/report-box") },
];
