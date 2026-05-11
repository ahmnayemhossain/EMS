import { RouterProvider } from "react-router";

import { AppProviders } from "@/core/app/providers/AppProviders";
import { router } from "@/core/bootstrap/router";
import { ErrorBoundary } from "@/core/errors/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
