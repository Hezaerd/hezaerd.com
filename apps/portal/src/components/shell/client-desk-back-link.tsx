import { Link } from "@tanstack/react-router";

export function ClientDeskBackLink() {
  return (
    <Link
      to="/op/clients"
      className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
    >
      ← Clients
    </Link>
  );
}
