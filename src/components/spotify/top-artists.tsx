"use client";

import useSWR, { mutate } from "swr";

import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { SpotifyArtistCard } from "@/components/spotify/artist-card";

const FetchError = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Top Artists</h1>
      <div className="text-center text-destructive">Failed to load artists</div>
      <Button
        onClick={() => {
          mutate("/api/spotify/top-artists");
        }}
        className="btn btn-primary"
      >
        Retry
      </Button>
    </div>
  );
};

const Loading = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Top Artists</h1>
      <div className="text-center text-primary/80">Loading artists...</div>
    </div>
  );
};

export default function TopArtists() {
  const { data, error, isLoading } = useSWR(
    "/api/spotify/top-artists",
    fetcher,
  );

  if (error) {
    return <FetchError />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Top Artists</h1>
      <div className="pt-4">
        {data.slice(0, 5).map((artist: any) => (
          <div key={artist.id} className="py-1">
            <SpotifyArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </div>
  );
}
