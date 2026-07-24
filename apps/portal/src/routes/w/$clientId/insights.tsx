import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hezaerd/ui/components/card";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { getClient } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/w/$clientId/insights")({
  beforeLoad: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client?.features.insights) {
      throw redirect({
        to: "/w/$clientId",
        params: { clientId: params.clientId },
      });
    }
  },
  component: ClientInsightsPage,
});

function ClientInsightsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Insights
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Three plain truths — not a mini analytics suite.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm" className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs uppercase">
              Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold">1,284</p>
            <p className="text-muted-foreground text-sm">Last 30 days</p>
          </CardContent>
        </Card>
        <Card size="sm" className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs uppercase">
              Top pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Home · Menu · Reservations</p>
          </CardContent>
        </Card>
        <Card size="sm" className="bg-muted/20 sm:col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs uppercase">
              Takeaway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              Reservation page visits climbed — consider highlighting weekend
              slots on Home.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
