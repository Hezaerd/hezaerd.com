"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

import { fetcher } from "@/lib/fetcher";
import { ISpotifyTrack } from "@/interfaces/spotify";
import { Button } from "@/components/ui/button";
import { SpotifyTrackCard } from "@/components/spotify/track-card";

const FetchError = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Top Tracks</h1>
      <div className="text-center text-destructive">Failed to load tracks</div>
      <Button
        onClick={() => {
          mutate("/api/spotify/top-tracks");
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
      <h1 className="text-2xl font-bold">Top Tracks</h1>
      <div className="text-center text-primary/80">Loading tracks...</div>
    </div>
  );
};

export default function TopTracks() {
  const { data, error, isLoading } = useSWR(
    "/api/spotify/top-tracks",
    fetcher,
    {
      refreshInterval: 1000 * 60 * 5,
      revalidateOnFocus: true,
    },
  );

  if (error) {
    return <FetchError />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="text-2xl font-bold">Top Tracks</h1>
      <motion.div
        className="pt-2 md:pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {data.slice(0, 5).map((track: ISpotifyTrack) => (
          <motion.div
            key={track.id}
            className="py-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * data.indexOf(track) }}
          >
            <SpotifyTrackCard track={track} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
