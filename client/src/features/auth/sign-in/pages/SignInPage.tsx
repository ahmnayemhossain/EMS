import { Navigate } from "react-router";

import { SignInForm } from "../modules/SignInForm";
import { useSignInPage } from "../modules/use-sign-in-page";

export function SignInPage() {
  const page = useSignInPage();
  if (page.token) return <Navigate to={page.redirectTo} replace />;
  return <SignInForm {...page} />;
}
