interface StatItemProps {
  number: string;
  label: string;
}

export function StatItem({ number, label }: StatItemProps) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-4xl md:text-5xl font-bold text-primary">{number}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
