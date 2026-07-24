import { Button } from "@hezaerd/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@hezaerd/ui/components/dropdown-menu";

import { Link } from "@tanstack/react-router";

import { listClients, type PortalClient } from "@/lib/portal-fixtures";

type WorkspaceSwitcherProps = {
  currentClient: PortalClient;
};

export function WorkspaceSwitcher({ currentClient }: WorkspaceSwitcherProps) {
  const otherClients = listClients().filter(
    (client) => client.id !== currentClient.id,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <span className="max-w-[12rem] truncate">{currentClient.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspace Switcher</DropdownMenuLabel>
          <DropdownMenuItem
            render={
              <Link to="/w/$clientId" params={{ clientId: currentClient.id }} />
            }
          >
            {currentClient.name}
          </DropdownMenuItem>
          {otherClients.map((client) => (
            <DropdownMenuItem
              key={client.id}
              render={
                <Link to="/w/$clientId" params={{ clientId: client.id }} />
              }
            >
              {client.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/op" />}>
            Back to Operator Home
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
