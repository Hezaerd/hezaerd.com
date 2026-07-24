import { Button } from "@hezaerd/ui/components/button";
import { CloudUploadIcon, File01Icon, FolderUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/files")({
  component: ClientFilesPage,
});

function ClientFilesPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={File01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Files</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Requested assets and your shared project folder.
        </p>
      </div>

      {/* Requested assets section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          Requests
        </h2>

        {/* File request card */}
        <div className="border-border bg-muted/20 hover:bg-muted/30 relative flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors">
          <div className="bg-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={FolderUploadIcon} size={16} className="text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold tracking-tight">Logo SVG</p>
            <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
              Upload a vector logo for the website refresh. Accepted formats: SVG, AI, EPS.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              <HugeiconsIcon icon={CloudUploadIcon} size={14} />
              Upload file
            </Button>
          </div>
          <span className="shrink-0 rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
            Pending
          </span>
        </div>
      </section>

      {/* Shared folder section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          Shared folder
        </h2>

        <div className="border-border bg-muted/10 flex flex-col items-center justify-center gap-2 rounded-xl border py-10 text-center">
          <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
            <HugeiconsIcon icon={FolderUploadIcon} size={16} className="text-muted-foreground" />
          </div>
          <p className="font-display text-sm font-semibold tracking-tight">No shared files yet</p>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Uploaded files and documents shared by Hezaerd will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}
