import Image from "next/image";

import { ISpotifyTrack } from "@/interfaces/spotify";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const SpotifyTrackCard = ({ track }: { track: ISpotifyTrack }) => {
  return (
    <a
      href={track.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
    >
      <motion.div
        className="w-80 rounded-lg p-1.5 transition-colors hover:bg-gray-50/5"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="flex w-full items-center space-x-4 rounded-md">
          <Image
            src={track.album.images[0].url}
            alt={track.name}
            width={64}
            height={64}
            className="rounded-md"
          />
          <div className="flex-1 overflow-hidden">
            <h2 className="truncate font-bold">
              {track.name.replace(/\s*\(.*?\)\s*/g, "")}
            </h2>
            <h3 className="truncate text-sm text-primary/80">
              {track.artists.map((artist) => artist.name).join(", ")}
            </h3>
          </div>
        </div>
      </motion.div>
    </a>
  );
};

export const SpotifyTrackCardSkeleton = () => {
  return (
    <div className="rounded-lg p-1.5">
      <div className="flex w-full items-center space-x-4">
        {/* Skeleton for the album image */}
        <Skeleton className="h-16 w-16 rounded-md" />

        {/* Skeleton for track name and artist */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" /> {/* Simulates track name */}
          <Skeleton className="h-4 w-1/2" /> {/* Simulates artist names */}
        </div>
      </div>
    </div>
  );
};
