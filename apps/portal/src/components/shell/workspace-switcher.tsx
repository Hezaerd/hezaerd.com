import { Button } from "@hezaerd/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@hezaerd/ui/components/dropdown-menu";

import { Link } from "@tanstack/react-router";

import { listClients, type PortalClient } from "@/lib/portal-fixtures";

type WorkspaceSwitcherProps = {
  currentClient: PortalClient;
};

export function WorkspaceSwitcher({ currentClient }: WorkspaceSwitcherProps) {
  const otherClients = listClients().filter((client) => client.id !== currentClient.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <span className="max-w-48 truncate">{currentClient.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch client</DropdownMenuLabel>
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
