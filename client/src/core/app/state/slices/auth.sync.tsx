import * as React from "react";

import { useAuthStore } from "@/core/app/state/slices/auth";

export function AuthSync() {
  const user = useAuthStore((state) => state.user);
  React.useEffect(() => {
    document.documentElement.dataset.auth = user ? "signed-in" : "signed-out";
  }, [user]);
  return null;
}
