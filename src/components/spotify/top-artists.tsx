"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

import { fetcher } from "@/lib/fetcher";
import { ISpotifyArtist } from "@/interfaces/spotify";
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
      <h1 className="text-2xl font-bold">Top Artists</h1>
      <motion.div
        className="pt-2 md:pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {data.slice(0, 5).map((artist: ISpotifyArtist) => (
          <motion.div
            key={artist.id}
            className="py-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * data.indexOf(artist) }}
          >
            <SpotifyArtistCard artist={artist} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
