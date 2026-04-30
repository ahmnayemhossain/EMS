import * as React from "react";
import { useLocation, useNavigate } from "react-router";

import { toast } from "@/core/app/lib/toast";
import { useAuth } from "@/core/app/state/auth";

import { loadCompanyOptions } from "./load-company-options";
import type { CompanyOption } from "./types";

export function useSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading, error, signIn } = useAuth();
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = React.useState(false);
  const [companiesLoaded, setCompaniesLoaded] = React.useState(false);
  const redirectTo = typeof location.state === "object" && location.state && "from" in location.state && typeof location.state.from === "string" ? location.state.from : "/dashboard";
  const canSubmit = login.trim().length > 0 && password.length > 0 && !loading;

  async function loadCompanies() {
    if (companiesLoaded || companiesLoading) return;
    setCompaniesLoading(true);
    try {
      const nextCompanies = await loadCompanyOptions();
      setCompanies(nextCompanies);
      setCompaniesLoaded(true);
      if (!companyId && nextCompanies[0]) setCompanyId(nextCompanies[0].id);
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : "Could not load companies.");
    } finally {
      setCompaniesLoading(false);
    }
  }

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

  return { token, loading, error, login, password, companyId, companies, companiesLoading, redirectTo, canSubmit, setLogin, setPassword, setCompanyId, loadCompanies, handleSubmit };
}
