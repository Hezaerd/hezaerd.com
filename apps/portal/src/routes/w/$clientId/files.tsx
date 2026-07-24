import { Button } from "@hezaerd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hezaerd/ui/components/card";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/files")({
  component: ClientFilesPage,
});

function ClientFilesPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Files</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Shared folder plus Operator file requests.
        </p>
      </div>
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Logo SVG</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Requested asset — upload a vector logo for the website refresh.
          </p>
          <Button variant="outline">Upload file</Button>
        </CardContent>
      </Card>
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Shared folder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Open uploads and shared files will list here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
