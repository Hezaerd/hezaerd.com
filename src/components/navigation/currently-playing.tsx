"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Music2, ExternalLink } from "lucide-react";

import { fetcher, SWR_CONFIG } from "@/lib/fetcher";
import { ISpotifyTrack } from "@/interfaces/spotify";

export const CurrentlyPlaying = () => {
  const { data: track, isLoading } = useSWR<ISpotifyTrack | null>(
    "/api/spotify/currently-playing",
    fetcher,
    {
      ...SWR_CONFIG,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary/50">
        <Music2 size={16} className="animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary/50">
        <Music2 size={16} />
        <span>Not playing</span>
      </div>
    );
  }

  return (
    <motion.a
      href={track.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-primary/50 hover:text-primary"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Music2 size={16} className="animate-pulse" />
      <span className="max-w-[200px] truncate">
        {track.name} - {track.artists[0].name}
      </span>
      <ExternalLink size={12} className="opacity-50" />
    </motion.a>
  );
};