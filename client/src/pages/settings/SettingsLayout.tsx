import * as React from "react";
import { Outlet } from "react-router";

export function SettingsLayout() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
}

