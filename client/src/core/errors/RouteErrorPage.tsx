import * as React from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";

export function RouteErrorPage() {
  const error = useRouteError();

  let title = "Something went wrong";
  let description = "An unexpected error occurred while loading this page.";
  let meta: React.ReactNode = null;

  if (isRouteErrorResponse(error)) {
    title = `Route error (${error.status})`;
    description = typeof error.data === "string" ? error.data : error.statusText || description;
    meta = <div className="text-muted-foreground mt-2 text-xs">{error.status} • {error.statusText}</div>;
  } else if (error instanceof Error) {
    description = error.message || description;
    meta = <div className="text-muted-foreground mt-2 text-xs">{error.name}</div>;
  }

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>{title}</CardTitle>
            <StatusBadge tone="critical">error</StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{description}</p>
          {meta}
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/utilities">Go to utilities</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Go to home</Link>
            </Button>
          </div>
          <div className="text-muted-foreground text-xs">Check browser console for stack trace.</div>
        </CardContent>
      </Card>
    </div>
  );
}
