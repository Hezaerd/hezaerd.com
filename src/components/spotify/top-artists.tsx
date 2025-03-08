"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

import { fetcher, SWR_CONFIG } from "@/lib/fetcher";
import { ISpotifyArtist } from "@/interfaces/spotify";
import { Button } from "@/components/ui/button";
import {
  SpotifyArtistCard,
  SpotifyArtistCardSkeleton,
} from "@/components/spotify/artist-card";
import { RefreshCw } from "lucide-react";

interface FetchErrorProps {
  title: string;
  endpoint: string;
}

const FetchError = ({ title, endpoint }: FetchErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="text-center text-destructive" aria-live="polite">
        Failed to load artists{" "}
        <Button
          onClick={() => {
            mutate(endpoint);
          }}
          variant="ghost"
          aria-label="Retry loading artists"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function TopArtists() {
  const endpoint = "/api/spotify/top-artists";
  const { data, error, isLoading, isValidating } = useSWR<ISpotifyArtist[]>(
    endpoint,
    fetcher,
    SWR_CONFIG,
  );

  if (error) {
    return <FetchError title="Top Artists" endpoint={endpoint} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="mb-4 text-2xl font-bold">
        Top Artists
        {isValidating && !isLoading && (
          <span className="ml-2 inline-block animate-spin text-xs">⟳</span>
        )}
      </h1>
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
