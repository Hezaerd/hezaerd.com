const deskSectionTitles: Record<string, string> = {
  invoices: "Factures",
  files: "Fichiers",
  insights: "Statistiques",
  settings: "Paramètres",
};

export function getOperatorHeaderTitle(pathname: string): string {
  if (pathname === "/op" || pathname === "/op/") {
    return "Accueil";
  }

  if (pathname === "/op/clients" || pathname === "/op/clients/") {
    return "Clients";
  }

  if (pathname.startsWith("/op/clients/")) {
    const rest = pathname.replace(/^\/op\/clients\/[^/]+/, "").replace(/^\//, "");
    if (!rest) {
      return "Bureau";
    }
    const segment = rest.split("/")[0] ?? "";
    return deskSectionTitles[segment] ?? "Bureau";
  }

  if (pathname.startsWith("/op/invoices")) {
    return "Factures";
  }

  if (pathname.startsWith("/op/settings")) {
    return "Paramètres";
  }

  return "Accueil";
}
