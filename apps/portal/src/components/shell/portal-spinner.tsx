import { Spinner } from "@hezaerd/ui/components/spinner";

export function PortalSpinner() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-6">
      <Spinner className="size-5" />
      <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
    </main>
  );
}
