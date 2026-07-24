import type { NeedsAttentionItem } from "@/lib/portal-fixtures";

import { Card, CardContent, CardHeader, CardTitle } from "@hezaerd/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";

import { Link } from "@tanstack/react-router";

type NeedsAttentionListProps = {
  items: NeedsAttentionItem[];
};

export function NeedsAttentionList({ items }: NeedsAttentionListProps) {
  if (items.length === 0) {
    return (
      <Empty className="border-border bg-muted/20 border">
        <EmptyHeader>
          <EmptyTitle>You&apos;re all caught up.</EmptyTitle>
          <EmptyDescription>
            Nothing needs your attention right now. Check back when something lands.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Card key={item.id} size="sm" className="bg-muted/20">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            <Link
              to={`/w/$clientId/${item.area}`}
              params={{ clientId: item.clientId }}
              className="text-primary w-fit text-sm font-medium hover:underline"
            >
              View
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
