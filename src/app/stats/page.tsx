import RecentlyPlayed from "@/components/spotify/recently-played";
import TopTracks from "@/components/spotify/top-tracks";

export default async function Stats() {
  return (
    <div className="flex">
      <div className="flex-1">Column 1</div>
      <div className="flex-1">
        <TopTracks />
      </div>
      <div className="flex-1">
        <RecentlyPlayed />
      </div>
    </div>
  );
}
