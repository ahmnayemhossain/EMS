import * as React from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { toast } from "@/core/app/lib/toast";
import { useAuth } from "@/core/app/state/slices/auth";
import { changePasswordRequest } from "@/core/app/state/slices/auth.api";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog(props: ChangePasswordDialogProps) {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!props.open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaving(false);
    }
  }, [props.open]);

  const validationError = React.useMemo(() => {
    if (!currentPassword) return "Current password is required.";
    if (!newPassword) return "New password is required.";
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword) return "New password and confirm password must match.";
    if (currentPassword === newPassword) return "New password must be different from current password.";
    return "";
  }, [confirmPassword, currentPassword, newPassword]);

  async function handleSave() {
    if (!token) {
      toast.error("You are not signed in.");
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      await changePasswordRequest({ currentPassword, newPassword }, token);
      toast.success("Password changed successfully.");
      props.onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Change password
          </DialogTitle>
          <DialogDescription>
            Use your current password, then set a new password for your account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
