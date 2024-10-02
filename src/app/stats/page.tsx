import RecentlyPlayed from "@/components/spotify/recently-played";
import TopAlbums from "@/components/spotify/top-artists";
import TopTracks from "@/components/spotify/top-tracks";

export default async function Stats() {
  return (
    <div className="flex">
      <div className="flex-1">
        <TopAlbums />
      </div>
      <div className="flex-1">
        <TopTracks />
      </div>
      <div className="flex-1">
        <RecentlyPlayed />
      </div>
    </div>
  );
}
