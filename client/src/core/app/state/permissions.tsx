import * as React from "react";
import { shallow } from "zustand/shallow";

import { useAuthStore } from "@/core/app/state/auth";
import { canAccessPermission } from "@/core/app/state/permissions.helpers";
import { usePermissionStore } from "@/core/app/state/permissions.store";
import { useUser } from "@/core/app/state/user";

export function PermissionSync() {
  const { userId } = useUser();
  const authUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const load = usePermissionStore((state) => state.load);
  const clear = usePermissionStore((state) => state.clear);

  React.useEffect(() => {
    if (!authUser) {
      clear();
      return;
    }

    void load(authUser.id || userId, token);
  }, [authUser, clear, load, token, userId]);

  return null;
}

export function usePermissions() {
  return usePermissionStore(
    (state) => ({
      permissionKeys: state.permissionKeys,
      loading: state.loading,
      error: state.error,
    }),
    shallow,
  );
}

export function useCan(permission?: string) {
  const { permissionKeys } = usePermissions();
  return canAccessPermission(permissionKeys, permission);
}
