import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/files")({
  component: ClientFilesLayout,
});

function ClientFilesLayout() {
  return <Outlet />;
}
