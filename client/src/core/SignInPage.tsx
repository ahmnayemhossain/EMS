import { Navigate } from "react-router";

import { SignInForm } from "./sign-in/SignInForm";
import { useSignInPage } from "./sign-in/use-sign-in-page";

export function SignInPage() {
  const page = useSignInPage();
  if (page.token) return <Navigate to={page.redirectTo} replace />;
  return <SignInForm {...page} />;
}
