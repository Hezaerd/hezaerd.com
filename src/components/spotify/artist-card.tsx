import { ISpotifyArtist } from "@/interfaces/spotify";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const SpotifyArtistCard = ({ artist }: { artist: ISpotifyArtist }) => {
  return (
    <motion.div
      className="w-80 rounded-lg p-1.5 transition-colors hover:bg-gray-50/5"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="flex w-full items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={artist.images[0].url}
            alt={artist.name}
            className="mx-auto"
          />
          <AvatarFallback>{artist.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <h2 className="truncate font-bold">{artist.name}</h2>
          <h3 className="truncate text-sm text-primary/80">
            {artist.genres.slice(0, 2).join(", ")}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export const SpotifyArtistCardSkeleton = () => {
  return (
    <div className="rounded-lg p-1.5">
      <div className="flex w-full items-center space-x-4">
        {/* Skeleton for the artist image */}
        <Skeleton className="h-16 w-16 rounded-md" />

        {/* Skeleton for artist name and genres */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" /> {/* Simulates artist name */}
          <Skeleton className="h-4 w-1/2" /> {/* Simulates artist genres */}
        </div>
      </div>
    </div>
  );
};
