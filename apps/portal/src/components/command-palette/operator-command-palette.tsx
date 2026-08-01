import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@hezaerd/ui/components/command";
import { Button } from "@hezaerd/ui/components/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@hezaerd/ui/components/sidebar";
import { cn } from "@hezaerd/ui/lib/utils";
import {
  Add01Icon,
  File01Icon,
  Home01Icon,
  Invoice01Icon,
  SearchIcon,
  Setting07Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { clientsListQuery } from "@/lib/convex-queries";
import {
  findClientByContactEmail,
  isValidClientEmail,
  normalizeClientEmail,
} from "@/lib/client-email";
import {
  type DeskSection,
  type OperatorRecentVisit,
  getDeskSectionLabel,
  parseClientDeskPath,
  readOperatorRecentVisits,
  recordOperatorRecentVisit,
} from "@/lib/operator-recents";
import { setPaletteHandoff } from "@/lib/palette-handoff";
import { toPortalClient, type PortalClient } from "@/lib/portal-types";

type PalettePage = "root" | "new-client-email" | "pick-client-invoice" | "pick-client-file";

type NavDestination = {
  label: string;
  to: "/op" | "/op/clients" | "/op/invoices" | "/op/settings";
  icon: IconSvgElement;
  keywords: string;
};

type DeskDestination = {
  label: string;
  section: DeskSection;
};

const navDestinations: NavDestination[] = [
  {
    label: "Accueil",
    to: "/op",
    icon: Home01Icon,
    keywords: "accueil home cockpit",
  },
  {
    label: "Clients",
    to: "/op/clients",
    icon: UserGroupIcon,
    keywords: "clients annuaire directory",
  },
  {
    label: "Factures",
    to: "/op/invoices",
    icon: Invoice01Icon,
    keywords: "factures invoices ledger",
  },
  {
    label: "Paramètres",
    to: "/op/settings",
    icon: Setting07Icon,
    keywords: "paramètres settings",
  },
];

const deskDestinations: DeskDestination[] = [
  { label: "Bureau", section: "" },
  { label: "Factures", section: "invoices" },
  { label: "Fichiers", section: "files" },
  { label: "Statistiques", section: "insights" },
  { label: "Paramètres", section: "settings" },
];

function clientDeskHref(slug: string, section: DeskSection) {
  if (section === "") {
    return { to: "/op/clients/$clientId" as const, params: { clientId: slug } };
  }

  return {
    to: `/op/clients/$clientId/${section}` as const,
    params: { clientId: slug },
  };
}

function focusCommandInput() {
  requestAnimationFrame(() => {
    document.querySelector<HTMLInputElement>('[data-slot="command-input"]')?.focus();
  });
}

function getInputPlaceholder(page: PalettePage): string {
  switch (page) {
    case "pick-client-invoice":
      return "Client pour la facture…";
    case "pick-client-file":
      return "Client pour la demande…";
    default:
      return "Rechercher…";
  }
}

function getNewClientEmailMessage(email: string, existingClients: PortalClient[]): string {
  if (!isValidClientEmail(email)) {
    return "Saisis un e-mail valide";
  }

  const duplicate = findClientByContactEmail(existingClients, email);
  if (duplicate) {
    return `E-mail déjà utilisé (${duplicate.name})`;
  }

  return `Continuer avec ${email.trim()}`;
}

type NewClientEmailStepProps = {
  email: string;
  existingClients: PortalClient[];
  onBack: () => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
};

function NewClientEmailStep({
  email,
  existingClients,
  onBack,
  onEmailChange,
  onSubmit,
}: NewClientEmailStepProps) {
  const duplicate = findClientByContactEmail(existingClients, email);
  const canSubmit = isValidClientEmail(email) && !duplicate;

  return (
    <Command shouldFilter={false}>
      <CommandInput
        autoFocus
        placeholder="E-mail du client…"
        value={email}
        onValueChange={onEmailChange}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onBack();
            return;
          }

          if (event.key === "Enter" && canSubmit) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <CommandList>
        <CommandGroup heading="Nouveau client">
          <CommandItem
            key={getNewClientEmailMessage(email, existingClients)}
            value="continuer valider email"
            disabled={!canSubmit}
            onSelect={onSubmit}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            <span>{getNewClientEmailMessage(email, existingClients)}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

type OperatorCommandPaletteContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const OperatorCommandPaletteContext = createContext<OperatorCommandPaletteContextValue | null>(
  null,
);

function useOperatorCommandPalette() {
  const context = useContext(OperatorCommandPaletteContext);
  if (!context) {
    throw new Error("useOperatorCommandPalette must be used within OperatorCommandPaletteProvider");
  }

  return context;
}

function getModKeyLabel() {
  if (typeof navigator === "undefined") {
    return "⌘";
  }

  return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ? "⌘" : "Ctrl+";
}

export function OperatorCommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <OperatorCommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </OperatorCommandPaletteContext.Provider>
  );
}

export function OperatorCommandPaletteHeaderTrigger({ className }: { className?: string }) {
  const { setOpen } = useOperatorCommandPalette();
  const modKey = getModKeyLabel();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("shrink-0", className)}
      aria-label={`Rechercher (${modKey}K)`}
      onClick={() => setOpen(true)}
    >
      <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
    </Button>
  );
}

export function OperatorCommandPaletteTrigger() {
  const { setOpen } = useOperatorCommandPalette();
  const modKey = getModKeyLabel();

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="outline"
              tooltip={`Rechercher (${modKey}K)`}
              onClick={() => setOpen(true)}
            >
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="shrink-0" />
              <span className="flex-1 truncate text-left">Rechercher…</span>
              <kbd
                className={cn(
                  "border-border bg-muted text-muted-foreground pointer-events-none hidden h-5 shrink-0 items-center rounded border px-1.5 font-mono text-[10px] font-medium select-none",
                  "group-data-[collapsible=icon]:hidden sm:inline-flex",
                )}
              >
                {modKey}K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function OperatorCommandPalette() {
  return (
    <Suspense fallback={null}>
      <OperatorCommandPaletteInner />
    </Suspense>
  );
}

function OperatorCommandPaletteInner() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: clientDocs } = useSuspenseQuery(clientsListQuery);
  const clients = useMemo(() => clientDocs.map(toPortalClient), [clientDocs]);

  const { open, setOpen } = useOperatorCommandPalette();
  const [page, setPage] = useState<PalettePage>("root");
  const [search, setSearch] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const pageRef = useRef<PalettePage>(page);
  pageRef.current = page;

  const clientsBySlug = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );

  const recents = useMemo(() => {
    return readOperatorRecentVisits()
      .map((visit) => {
        const client = clientsBySlug.get(visit.slug);
        if (!client) {
          return null;
        }

        return { visit, client };
      })
      .filter(
        (entry): entry is { visit: OperatorRecentVisit; client: PortalClient } => entry !== null,
      );
  }, [clientsBySlug]);

  useEffect(() => {
    const visit = parseClientDeskPath(pathname);
    if (visit) {
      recordOperatorRecentVisit(visit);
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (open && page === "root") {
      focusCommandInput();
    }
  }, [open, page]);

  const goBackToRoot = useCallback(() => {
    setPage("root");
    setSearch("");
    setEmailDraft("");
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    goBackToRoot();
  }, [goBackToRoot]);

  const runCommand = useCallback(
    (command: () => void) => {
      closePalette();
      command();
    },
    [closePalette],
  );

  useHotkey(
    "Mod+K",
    (event) => {
      event.preventDefault();
      setOpen((current) => {
        if (current) {
          goBackToRoot();
        }
        return !current;
      });
    },
    { preventDefault: true },
  );

  useHotkey(
    "Escape",
    (event) => {
      if (!open) {
        return;
      }

      event.preventDefault();
      if (pageRef.current === "root") {
        closePalette();
        return;
      }

      goBackToRoot();
    },
    { enabled: open, preventDefault: true },
  );

  const handleOpenChange = useCallback(
    (
      nextOpen: boolean,
      eventDetails?: {
        cancel: () => void;
        reason?: string;
      },
    ) => {
      if (!nextOpen && pageRef.current !== "root") {
        eventDetails?.cancel();
        goBackToRoot();
        return;
      }

      setOpen(nextOpen);
      if (!nextOpen) {
        goBackToRoot();
      }
    },
    [goBackToRoot],
  );

  const handlePaletteEscape = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Escape" || pageRef.current === "root") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      goBackToRoot();
    },
    [goBackToRoot],
  );

  const submitNewClientEmail = useCallback(() => {
    const email = normalizeClientEmail(emailDraft);
    if (!isValidClientEmail(email) || findClientByContactEmail(clients, email)) {
      return;
    }

    runCommand(() => {
      setPaletteHandoff({ type: "new-client", contactEmail: email });
      if (pathname !== "/op/clients" && pathname !== "/op/clients/") {
        void navigate({ to: "/op/clients" });
      }
    });
  }, [clients, emailDraft, navigate, pathname, runCommand]);

  const goToClientDesk = useCallback(
    (slug: string, section: DeskSection) => {
      const href = clientDeskHref(slug, section);
      runCommand(() => {
        void navigate(href);
      });
    },
    [navigate, runCommand],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Palette opérateur"
      description="Navigation rapide dans le portail opérateur"
      className="operator-command-palette-content top-[20%] max-w-lg translate-y-0 sm:max-w-lg"
      showCloseButton={false}
    >
      {page === "new-client-email" ? (
        <NewClientEmailStep
          email={emailDraft}
          existingClients={clients}
          onBack={goBackToRoot}
          onEmailChange={setEmailDraft}
          onSubmit={submitNewClientEmail}
        />
      ) : (
        <Command
          key={page}
          shouldFilter={page === "root" || page.startsWith("pick-client")}
        >
          <CommandInput
            placeholder={getInputPlaceholder(page)}
            value={search}
            onValueChange={setSearch}
            onKeyDown={handlePaletteEscape}
          />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>

            {page === "root" ? (
            <>
              {recents.length > 0 ? (
                <>
                  <CommandGroup heading="Récents">
                    {recents.map(({ visit, client }) => (
                      <CommandItem
                        key={`${visit.slug}-${visit.section}-${visit.visitedAt}`}
                        value={`${client.name} ${getDeskSectionLabel(visit.section)} récent`}
                        onSelect={() => goToClientDesk(client.id, visit.section)}
                      >
                        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                        <span>
                          {client.name} · {getDeskSectionLabel(visit.section)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              ) : null}

              <CommandGroup heading="Navigation">
                {navDestinations.map((item) => (
                  <CommandItem
                    key={item.to}
                    value={`${item.label} ${item.keywords}`}
                    onSelect={() => {
                      runCommand(() => {
                        void navigate({ to: item.to });
                      });
                    }}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Clients">
                {clients.flatMap((client) =>
                  deskDestinations.map((desk) => (
                    <CommandItem
                      key={`${client.id}-${desk.section}`}
                      value={`${client.name} ${desk.label} client desk`}
                      onSelect={() => goToClientDesk(client.id, desk.section)}
                    >
                      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                      <span>
                        {client.name} · {desk.label}
                      </span>
                    </CommandItem>
                  )),
                )}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Actions">
                <CommandItem
                  value="nouveau client créer email"
                  onSelect={() => {
                    setEmailDraft("");
                    setPage("new-client-email");
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                  <span>Nouveau client…</span>
                </CommandItem>
                <CommandItem
                  value="nouvelle facture créer invoice"
                  onSelect={() => {
                    setPage("pick-client-invoice");
                    setSearch("");
                  }}
                >
                  <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />
                  <span>Nouvelle facture pour…</span>
                </CommandItem>
                <CommandItem
                  value="nouvelle demande fichier file request"
                  onSelect={() => {
                    setPage("pick-client-file");
                    setSearch("");
                  }}
                >
                  <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
                  <span>Nouvelle demande de fichier pour…</span>
                </CommandItem>
              </CommandGroup>
            </>
            ) : null}

            {page === "pick-client-invoice" ? (
              <CommandGroup heading="Client">
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => goToClientDesk(client.id, "invoices")}
                  >
                    <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />
                    <span>{client.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {page === "pick-client-file" ? (
              <CommandGroup heading="Client">
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => goToClientDesk(client.id, "files")}
                  >
                    <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
                    <span>{client.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      )}
    </CommandDialog>
  );
}
