import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/settings")({
  component: OperatorSettingsPage,
});

function OperatorSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Practice settings — coming soon
      </p>
    </div>
  );
}
