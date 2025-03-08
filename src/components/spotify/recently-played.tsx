"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

// Maximum number of tracks to display
const MAX_TRACKS = 5;

// Interface for track items with a unique identifier
interface TrackWithUniqueId extends ISpotifyTrack {
  uniqueKey?: string;
}

export default function RecentlyPlayed() {
  const endpoint = "/api/spotify/recently-played";
  // Local state to manage displayed tracks
  const [displayedTracks, setDisplayedTracks] = useState<TrackWithUniqueId[]>(
    [],
  );

  const { data, error, isLoading, isValidating } = useSWR<ISpotifyTrack[]>(
    endpoint,
    fetcher,
    {
      ...SWR_CONFIG,
      // Recently played needs more frequent updates than other endpoints
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Update displayed tracks when new data arrives, ensuring we only show the MAX_TRACKS most recent tracks
  useEffect(() => {
    if (data && data.length > 0) {
      // Take only the most recent tracks (up to MAX_TRACKS)
      const recentTracks = data.slice(0, MAX_TRACKS).map((track, index) => ({
        ...track,
        // Create a unique key for each track combining track ID and index
        uniqueKey: `${track.id}-${index}-${Date.now()}`,
      }));

      setDisplayedTracks(recentTracks);
    }
  }, [data]);

  if (error) {
    return <FetchError title="Recently Played" endpoint={endpoint} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-screen md:py-0">
      <h1 className="mb-4 text-2xl font-bold">
        Recently Played
        {isValidating && !isLoading && (
          <span className="ml-2 inline-block animate-spin text-xs">⟳</span>
        )}
      </h1>
      <div aria-live="polite">
        {isLoading ? (
          <motion.div>
            {[...Array(MAX_TRACKS)].map((_, index: number) => (
              <motion.div
                key={`skeleton-${index}`}
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
            {displayedTracks.map((track: TrackWithUniqueId, index: number) => (
              <div key={track.uniqueKey || `track-${index}`} className="py-1">
                <SpotifyTrackCard track={track} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
