import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/clients/$clientId/files")({
  component: ClientDeskFilesLayout,
});

function ClientDeskFilesLayout() {
  return <Outlet />;
}
