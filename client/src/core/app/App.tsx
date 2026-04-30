import { RouterProvider } from "react-router";

import { AppProviders } from "@/core/app/providers/AppProviders";
import { router } from "@/core/router";

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
