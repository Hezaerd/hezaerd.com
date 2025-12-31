interface TimelineItemProps {
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export function TimelineItem({ title, subtitle, period, description }: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
        <div className="w-0.5 flex-1 bg-primary/30 mt-2" />
      </div>
      <div className="flex-1 pb-8">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-primary">{subtitle}</p>
        <p className="text-xs text-muted-foreground mb-2">{period}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
