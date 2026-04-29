import { Loader2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

import type { CompanyOption } from "./types";

type SignInFormProps = {
  login: string; password: string; companyId: string; error: string | null;
  loading: boolean; companiesLoading: boolean; companies: CompanyOption[];
  canSubmit: boolean; setLogin: (value: string) => void; setPassword: (value: string) => void;
  setCompanyId: (value: string) => void; loadCompanies: () => Promise<void>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function SignInForm(props: SignInFormProps) {
  return <main className="bg-background grid min-h-svh place-items-center px-4 py-8"><form onSubmit={props.handleSubmit} className="border-border bg-card text-card-foreground w-full max-w-[380px] rounded-lg border p-6 shadow-sm"><h1 className="text-center text-xl font-semibold leading-tight">Fortis Group EMS</h1><div className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="login">User ID / Username</Label><Input id="login" autoComplete="username" value={props.login} onChange={(event) => props.setLogin(event.target.value)} placeholder="Employee ID or email address" required /></div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" value={props.password} onChange={(event) => props.setPassword(event.target.value)} placeholder="Input password" required /></div><div className="space-y-2"><Label>Company</Label><Select value={props.companyId || undefined} onValueChange={props.setCompanyId} onOpenChange={(open) => { if (open) void props.loadCompanies(); }}><SelectTrigger><SelectValue placeholder={props.companiesLoading ? "Loading..." : "Select company"} /></SelectTrigger><SelectContent>{props.companies.length ? props.companies.map((company) => <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>) : <SelectItem value="__empty" disabled>{props.companiesLoading ? "Loading..." : "No company found"}</SelectItem>}</SelectContent></Select></div></div>{props.error ? <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{props.error}</div> : null}<Button type="submit" className="mt-5 w-full" disabled={!props.canSubmit}>{props.loading ? <Loader2 className="size-4 animate-spin" /> : null}Sign in</Button></form></main>;
}
