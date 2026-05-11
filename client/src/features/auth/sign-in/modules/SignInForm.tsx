import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";

type SignInFormProps = {
  login: string; password: string; error: string | null;
  loading: boolean;
  canSubmit: boolean; setLogin: (value: string) => void; setPassword: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function SignInForm(props: SignInFormProps) {
  return (
    <main className="bg-background grid min-h-svh place-items-center px-4 py-8">
      <form
        onSubmit={props.handleSubmit}
        className="border-border bg-card text-card-foreground w-full max-w-[380px] rounded-lg border p-6 shadow-sm"
      >
        <h1 className="text-center text-xl font-semibold leading-tight">Sign in</h1>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">User ID / Username</Label>
            <Input
              id="login"
              autoComplete="username"
              value={props.login}
              onChange={(event) => props.setLogin(event.target.value)}
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
              value={props.password}
              onChange={(event) => props.setPassword(event.target.value)}
              placeholder="Input password"
              required
            />
          </div>
        </div>

        {props.error ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {props.error}
          </div>
        ) : null}

        <Button type="submit" className="mt-5 w-full" disabled={!props.canSubmit}>
          {props.loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign in
        </Button>

        <div className="text-muted-foreground mt-4 text-center text-xs">
          Part of Project <span className="text-foreground font-medium">UpFortis</span>
        </div>
      </form>
    </main>
  );
}

