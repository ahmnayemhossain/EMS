import type { PublicRouteDef } from "@/core/routes/route.types";

export const publicRouteDefs: PublicRouteDef[] = [
  { path: "/sign-in", segment: "sign-in", label: "Sign in", exportName: "SignInPage", load: () => import("@/core/SignInPage") },
  { path: "/rb/:code", segment: "rb", label: "Report box", exportName: "PublicReportBoxPage", load: () => import("@/features/PublicReportBoxPage") },
  { path: "rb/:code", segment: "rb", label: "Report box", exportName: "PublicReportBoxPage", load: () => import("@/features/PublicReportBoxPage") },
];
