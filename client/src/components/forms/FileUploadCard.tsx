import * as React from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";

export function FileUploadCard({
  title,
  description,
  onUpload,
}: {
  title: string;
  description?: string;
  onUpload?: () => void;
}) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
        <div className="bg-muted/40 flex items-center justify-between gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-background grid shrink-0 size-10 md:size-11 place-items-center rounded-xl border">
              <Upload className="size-5 md:size-6" />
            </div>
            <div>
              <div className="text-sm font-medium">Drop files here</div>
              <div className="text-muted-foreground text-xs">PDF, XLSX, JPG</div>
            </div>
          </div>
          <Button variant="outline" onClick={onUpload}>
            Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

