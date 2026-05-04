import { RouterProvider } from "react-router";

import { AppProviders } from "@/core/app/providers/AppProviders";
import { router } from "@/core/router";
import { ErrorBoundary } from "@/core/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
