type InsightsTakeawayProps = {
  text: string;
};

export function InsightsTakeaway({ text }: InsightsTakeawayProps) {
  return (
    <p className="border-border bg-muted/30 text-foreground/90 rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed">
      {text}
    </p>
  );
}
