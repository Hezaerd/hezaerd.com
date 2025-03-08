"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";

import { fetcher, SWR_CONFIG } from "@/lib/fetcher";
import { ISpotifyTrack } from "@/interfaces/spotify";
import { Button } from "@/components/ui/button";
import {
  SpotifyTrackCard,
  SpotifyTrackCardSkeleton,
} from "@/components/spotify/track-card";
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
        Failed to load tracks{" "}
        <Button
          onClick={() => {
            mutate(endpoint);
          }}
          variant="ghost"
          aria-label="Retry loading tracks"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function TopTracks() {
  const endpoint = "/api/spotify/top-tracks";
  const { data, error, isLoading, isValidating } = useSWR<ISpotifyTrack[]>(
    endpoint,
    fetcher,
    SWR_CONFIG,
  );

  if (error) {
    return <FetchError title="Top Tracks" endpoint={endpoint} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="mb-4 text-2xl font-bold">
        Top Tracks
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
                <SpotifyTrackCardSkeleton />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {data?.map((track: ISpotifyTrack, index: number) => (
              <div key={track.id || index} className="py-1">
                <SpotifyTrackCard track={track} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
