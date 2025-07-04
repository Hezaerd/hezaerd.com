import { Suspense } from "react";
import SpotifyStats from "@/app/stats/components/spotify/spotify-stats";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <Card className="flex-1 p-6">
        <div className="mb-4 h-8 w-24 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </Card>
      <Card className="flex-1 p-6">
        <div className="mb-4 h-8 w-24 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </Card>
      <Card className="flex-1 p-6">
        <div className="mb-4 h-8 w-24 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export const metadata = createMetadata({
  title: "Stats",
  description: "My stats from various platforms like Github, Spotify, etc.",
});

export default function Stats() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-star-overlay">
        <Suspense fallback={<LoadingSkeleton />}>
          <SpotifyStats />
        </Suspense>
      </div>
    </div>
  );
}
