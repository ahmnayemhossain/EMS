import * as React from "react";
import { useLocation, useNavigate } from "react-router";

import { toast } from "@/core/app/lib/toast";
import { useAuth } from "@/core/app/state/slices/auth";

export function useSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading, error, signIn } = useAuth();
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const redirectTo = typeof location.state === "object" && location.state && "from" in location.state && typeof location.state.from === "string" ? location.state.from : "/utilities";
  const canSubmit = login.trim().length > 0 && password.length > 0 && !loading;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      await signIn({ login, password });
      toast.success("Signed in successfully.");
      navigate(redirectTo, { replace: true });
    } catch (signInError) {
      toast.error(signInError instanceof Error ? signInError.message : "Could not sign in.");
    }
  }

  return { token, loading, error, login, password, redirectTo, canSubmit, setLogin, setPassword, handleSubmit };
}
