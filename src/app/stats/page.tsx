import { Suspense } from "react";
import RecentlyPlayed from "@/app/stats/components/spotify/recently-played";
import TopArtists from "@/app/stats/components/spotify/top-artists";
import TopTracks from "@/app/stats/components/spotify/top-tracks";
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
    <section id="spotify" className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">Spotify Stats</h1>
      <p className="mb-8 text-center text-muted-foreground">
        A look at my current Spotify listening habits
      </p>

      <Suspense fallback={<LoadingSkeleton />}>
        <div className="flex flex-col gap-8 md:flex-row">
          <Card className="flex-1 p-6">
            <TopArtists />
          </Card>
          <Card className="flex-1 p-6">
            <TopTracks />
          </Card>
          <Card className="flex-1 p-6">
            <RecentlyPlayed />
          </Card>
        </div>
      </Suspense>
    </section>
  );
}
