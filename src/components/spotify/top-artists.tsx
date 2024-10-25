"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

import { fetcher } from "@/lib/fetcher";
import { ISpotifyArtist } from "@/interfaces/spotify";
import { Button } from "@/components/ui/button";
import {
  SpotifyArtistCard,
  SpotifyArtistCardSkeleton,
} from "@/components/spotify/artist-card";
import { RefreshCw } from "lucide-react";

const FetchError = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="mb-4 text-2xl font-bold">Top Artists</h1>
      <div className="text-center text-destructive" aria-live="polite">
        Failed to load artists{" "}
        <Button
          onClick={() => {
            mutate("/api/spotify/top-artists");
          }}
          variant="ghost"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
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
      onSuccess: () => {
        console.log("Successfully refreshed top artists");
      },
    },
  );

  if (error) {
    return <FetchError />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="mb-4 text-2xl font-bold">Top Artists</h1>
      <div aria-live="polite">
        {isLoading ? (
          <motion.div>
            {[...Array(5)].map((_, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="py-1"
              >
                <SpotifyArtistCardSkeleton />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {data?.map((artist: ISpotifyArtist, index: number) => (
              <div key={artist.id || index} className="py-1">
                <SpotifyArtistCard artist={artist} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
