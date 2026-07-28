import { Empty, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { cn } from "@hezaerd/ui/lib/utils";

type ClientDeskPageProps = {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
};

export function ClientDeskPage({ children, wide = false, className }: ClientDeskPageProps) {
  return (
    <div className={cn("flex flex-col gap-6", wide ? "max-w-5xl" : "max-w-3xl", className)}>
      {children}
    </div>
  );
}

type ClientDeskPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function ClientDeskPageHeader({ title, description, action }: ClientDeskPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function DeskSectionHeading({ title }: { title: string }) {
  return <h2 className="text-muted-foreground text-sm font-medium">{title}</h2>;
}

type DeskCardProps = React.ComponentProps<"section">;

export function DeskCard({ className, children, ...props }: DeskCardProps) {
  return (
    <section
      className={cn(
        "border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

type DeskCardHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function DeskCardHeader({ title, description, action }: DeskCardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type DeskEmptyStateProps = {
  title: string;
  className?: string;
};

export function DeskEmptyState({ title, className }: DeskEmptyStateProps) {
  return (
    <Empty className={cn("border-border bg-muted/20 rounded-xl border py-12", className)}>
      <EmptyHeader>
        <EmptyTitle className="font-display text-base font-semibold tracking-tight">
          {title}
        </EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
