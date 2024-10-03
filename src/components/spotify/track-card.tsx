import Image from "next/image";

import { ISpotifyTrack } from "@/interfaces/spotify";

export const SpotifyTrackCard = ({ track }: { track: ISpotifyTrack }) => {
  return (
    <div className="flex w-full items-center space-x-4">
      <Image
        src={track.album.images[0].url}
        alt={track.name}
        width={64}
        height={64}
        className="rounded-md"
      />
      <div className="flex-1">
        <h2 className="font-bold">{track.name}</h2>
        <p className="text-sm text-primary/80">
          {track.artists.map((artist) => artist.name).join(", ")}
        </p>
      </div>
    </div>
  );
};
