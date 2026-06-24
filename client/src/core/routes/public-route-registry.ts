import type { PublicRouteDef } from "@/core/routes/route.types";

export const publicRouteDefs: PublicRouteDef[] = [
  { path: "/sign-in", segment: "sign-in", label: "Sign in", exportName: "SignInPage", load: () => import("@/features/auth/sign-in/pages/SignInPage") },
];
