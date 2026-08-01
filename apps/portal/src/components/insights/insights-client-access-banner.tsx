type InsightsClientAccessBannerProps = {
  insightsEnabled: boolean;
};

export function InsightsClientAccessBanner({ insightsEnabled }: InsightsClientAccessBannerProps) {
  if (insightsEnabled) {
    return null;
  }

  return (
    <div className="border-border bg-muted/30 rounded-xl border px-4 py-3">
      <p className="text-sm font-medium">Accès client désactivé</p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Le client ne voit pas Statistiques dans son espace. La collecte continue.
      </p>
    </div>
  );
}
