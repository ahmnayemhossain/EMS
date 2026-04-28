import * as React from "react";
import { Loader2 } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "@/app/lib/toast";
import { useAuth } from "@/app/state/auth";

type CompanyOption = {
  id: string;
  name: string;
};

async function loadCompanyOptions() {
  const response = await fetch("/api/system/companies/options", { cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not load companies.");
  return Array.isArray(data)
    ? data.map((company) => ({ id: String(company.id), name: String(company.name || "Company") }))
    : [];
}

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading, error, signIn } = useAuth();
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = React.useState(false);
  const [companiesLoaded, setCompaniesLoaded] = React.useState(false);

  const redirectTo =
    typeof location.state === "object" &&
    location.state &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/dashboard";

  if (token) return <Navigate to={redirectTo} replace />;

  const loadCompanies = async () => {
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
  };

  const canSubmit = login.trim().length > 0 && password.length > 0 && !loading;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      await signIn({ login, password });
      toast.success("Signed in successfully.");
      navigate(redirectTo, { replace: true });
    } catch (signInError) {
      toast.error(signInError instanceof Error ? signInError.message : "Could not sign in.");
    }
  };

  return (
    <main className="bg-background grid min-h-svh place-items-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card text-card-foreground w-full max-w-[380px] rounded-lg border p-6 shadow-sm"
      >
        <h1 className="text-center text-xl font-semibold leading-tight">Fortis Group EMS</h1>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">User ID / Username</Label>
            <Input
              id="login"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="Employee ID or email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Input password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Company</Label>
            <Select
              value={companyId || undefined}
              onValueChange={setCompanyId}
              onOpenChange={(open) => {
                if (open) void loadCompanies();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={companiesLoading ? "Loading..." : "Select company"} />
              </SelectTrigger>
              <SelectContent>
                {companies.length ? (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty" disabled>
                    {companiesLoading ? "Loading..." : "No company found"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="mt-5 w-full" disabled={!canSubmit}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign in
        </Button>
      </form>
    </main>
  );
}

