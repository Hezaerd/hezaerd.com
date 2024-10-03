import { ISpotifyArtist } from "@/interfaces/spotify";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const SpotifyArtistCard = ({ artist }: { artist: ISpotifyArtist }) => {
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-16 w-16">
        <AvatarImage
          src={artist.images[0].url}
          alt={artist.name}
          className="mx-auto"
        />
        <AvatarFallback>{artist.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-lg font-bold">{artist.name}</h2>
        {/* genre */}
        <h3 className="text-sm text-primary/80">
          {artist.genres.slice(0, 2).join(", ")}
        </h3>
      </div>
    </div>
  );
};
