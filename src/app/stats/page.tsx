import RecentlyPlayed from "@/components/spotify/recently-played";
import TopAlbums from "@/components/spotify/top-artists";
import TopTracks from "@/components/spotify/top-tracks";

export default async function Stats() {
  return (
    <section id="spotify" className="py-16 md:py-0">
      <div className="flex flex-col md:flex-row">
        {/* <div className="flex-1">
          <TopAlbums />
        </div>
        <div className="flex-1">
          <TopTracks />
        </div> */}
        <div className="flex-1">
          <RecentlyPlayed />
        </div>
      </div>
    </section>
  );
}
