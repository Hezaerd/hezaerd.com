"use client";

import TopArtists from "@/app/stats/components/spotify/top-artists";
import TopTracks from "@/app/stats/components/spotify/top-tracks";
import RecentlyPlayed from "@/app/stats/components/spotify/recently-played";

export default function SpotifyStats() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="mb-4 text-center text-3xl font-bold">Spotify Stats</h1>
        <p className="mb-8 text-center text-muted-foreground">
          A look at my current Spotify listening habits
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <TopArtists />
          </div>
          <div className="flex flex-col">
            <TopTracks />
          </div>
          <div className="flex flex-col">
            <RecentlyPlayed />
          </div>
        </div>
      </div>
    </div>
  );
}
