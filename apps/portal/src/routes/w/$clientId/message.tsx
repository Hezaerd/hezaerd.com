import { Button } from "@hezaerd/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hezaerd/ui/components/card";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/message")({
  component: ClientMessagePage,
});

function ClientMessagePage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Message Hezaerd</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          A lightweight note to the practice — not a helpdesk ticket.
        </p>
      </div>
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Send a message</CardTitle>
          <CardDescription>
            Your note will surface for the Operator on their work cues.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label htmlFor="message-body" className="sr-only">
            Message to Hezaerd
          </label>
          <textarea
            id="message-body"
            className="border-border bg-background min-h-32 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="What should Hezaerd know?"
          />
          <Button className="self-start">Send message</Button>
        </CardContent>
      </Card>
    </div>
  );
}
