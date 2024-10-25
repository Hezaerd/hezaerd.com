"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

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
      <h1 className="text-2xl font-bold">Recently Played</h1>
      <motion.div
        className="pt-2 md:pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {data.map((track: any, index: number) => (
          <motion.div
            key={track.id || index}
            className="py-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * data.indexOf(track) }}
          >
            <SpotifyTrackCard track={track.track} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
