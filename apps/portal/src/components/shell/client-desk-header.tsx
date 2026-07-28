import type { PortalClient } from "@/lib/portal-types";

type ClientDeskIdentityProps = {
  client: PortalClient;
  initials: string;
  className?: string;
};

export function ClientDeskIdentity({ client, initials, className }: ClientDeskIdentityProps) {
  return (
    <div
      className={[
        "flex max-w-full shrink-0 items-center gap-3 xl:mb-2 xl:max-w-xs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold tracking-tight">{client.name}</p>
        <p className="text-muted-foreground truncate text-xs">{client.contactEmail}</p>
      </div>
      <div className="bg-primary/10 border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
        <span className="text-primary font-mono text-xs font-semibold tracking-wider">
          {initials}
        </span>
      </div>
    </div>
  );
}

export function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
