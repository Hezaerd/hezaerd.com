"use client";

import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, AlertTriangle, ArrowRight } from "lucide-react";

import { fetcher, SWR_CONFIG } from "@/lib/fetcher";
import { ISpotifyArtist } from "@/interfaces/spotify";
import { Button } from "@/components/ui/button";
import {
  SpotifyArtistCard,
  SpotifyArtistCardSkeleton,
} from "@/app/stats/components/spotify/artist-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TimeRange, TIME_RANGES } from "@/lib/spotify";

interface FetchErrorProps {
  title: string;
  endpoint: string;
  error: any;
}

const FetchError = ({ title, endpoint, error }: FetchErrorProps) => {
  const errorMessage = error?.error || "Failed to load artists";
  const isConfigError = errorMessage.includes("not properly configured") ||
                        errorMessage.includes("Unable to authenticate");

  return (
    <div className="flex flex-col items-center justify-center py-4 md:h-auto">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="text-center" aria-live="polite">
        <div className="mb-2 flex items-center justify-center text-destructive">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{errorMessage}</span>
        </div>

        {!isConfigError && (
          <Button
            onClick={() => {
              mutate(endpoint);
            }}
            variant="outline"
            size="sm"
            aria-label="Retry loading artists"
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}

        {error?.details && (
          <p className="mt-2 text-xs text-muted-foreground">
            {error.details}
          </p>
        )}
      </div>
    </div>
  );
};

export default function TopArtists() {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [isOpen, setIsOpen] = useState(false);
  const endpoint = `/api/spotify/top-artists?time_range=${timeRange}`;
  const { data, error, isLoading, isValidating } = useSWR<ISpotifyArtist[]>(
    endpoint,
    fetcher,
    SWR_CONFIG,
  );

  if (error) {
    return <FetchError title="Top Artists" endpoint={endpoint} error={error} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 md:py-0">
      <h1 className="mb-4 text-2xl font-bold">
        Top Artists
        {isValidating && !isLoading && (
          <span className="ml-2 inline-block animate-spin text-xs">⟳</span>
        )}
      </h1>
      <div className="mb-4 flex items-center justify-center gap-2">
        <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground focus:outline-none">
            {TIME_RANGES[timeRange]}
            {isOpen ? (
              <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 opacity-50 transition-transform duration-200" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[200px]">
            {Object.entries(TIME_RANGES).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setTimeRange(key as TimeRange)}
                className="cursor-pointer"
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
