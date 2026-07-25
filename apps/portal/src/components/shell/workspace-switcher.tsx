import { Button } from "@hezaerd/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@hezaerd/ui/components/dropdown-menu";
import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { Link } from "@tanstack/react-router";

import { type PortalClient, toPortalClient } from "@/lib/portal-types";

type WorkspaceSwitcherProps = {
  currentClient: PortalClient;
};

export function WorkspaceSwitcher({ currentClient }: WorkspaceSwitcherProps) {
  const clients = useQuery(api.clients.list);

  if (clients === undefined) {
    return (
      <Button variant="outline" size="sm" disabled>
        <span className="max-w-48 truncate">{currentClient.name}</span>
      </Button>
    );
  }

  const otherClients = clients
    .map((client) => toPortalClient(client))
    .filter((client) => client.id !== currentClient.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <span className="max-w-48 truncate">{currentClient.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Changer de client</DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link to="/w/$clientId" params={{ clientId: currentClient.id }} />}
          >
            {currentClient.name}
          </DropdownMenuItem>
          {otherClients.map((client) => (
            <DropdownMenuItem
              key={client.id}
              render={<Link to="/w/$clientId" params={{ clientId: client.id }} />}
            >
              {client.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
