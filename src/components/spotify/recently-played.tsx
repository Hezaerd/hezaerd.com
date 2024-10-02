"use client";

import useSWR, { mutate } from "swr";

import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { SpotifyTrackCard } from "@/components/spotify/track-card";

const FetchError = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Recently Played</h1>
      <div className="text-center text-destructive">Failed to load tracks</div>
      <Button
        onClick={() => {
          mutate("/api/spotify/recently-played");
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
      <h1 className="text-2xl font-bold">Recently Played</h1>
      <div className="text-center text-primary/80">Loading tracks...</div>
    </div>
  );
};

export default function RecentlyPlayed() {
  const { data, error, isLoading } = useSWR(
    "/api/spotify/recently-played",
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
      <h1 className="text-2xl font-bold">Recently Played</h1>
      <div className="pt-4">
        {data.map((track: any) => (
          <div key={track.played_at} className="py-1">
            <SpotifyTrackCard track={track.track} />
          </div>
        ))}
      </div>
    </div>
  );
}
