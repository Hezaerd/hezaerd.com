import {
  Clock01Icon,
  MusicNote03Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, type ReactNode } from "react";

import { ColumnRowsSkeleton } from "@/components/spotify/spotify-stats-skeleton";
import {
  recentlyPlayedQueryOptions,
  topArtistsQueryOptions,
  topTracksQueryOptions,
} from "@/lib/spotify-queries";
import type { TimeRange } from "@/types/spotify";

const VISIBLE_COUNT = 5;

type SpotifyStatsGridProps = {
  timeRange: TimeRange;
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="bg-secondary text-secondary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded text-[10px] font-medium">
      {rank}
    </span>
  );
}

function EmptyRow() {
  return (
    <div className="text-muted-foreground flex h-16 items-center justify-center">—</div>
  );
}

function StatsColumn({
  title,
  icon,
  bordered,
  children,
}: {
  title: string;
  icon: IconSvgElement;
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        bordered
          ? "border-border flex h-full flex-col md:border-r"
          : "flex h-full flex-col"
      }
    >
      <div className="border-border border-b p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <HugeiconsIcon icon={icon} size={20} className="text-primary" />
          {title}
        </h3>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function TopArtistsRows({ timeRange }: { timeRange: TimeRange }) {
  const { data: topArtists } = useSuspenseQuery(topArtistsQueryOptions(timeRange));

  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: VISIBLE_COUNT }).map((_, index) => {
        const artist = topArtists[index];
        if (!artist) {
          return <EmptyRow key={`artist-empty-${index}`} />;
        }

        return (
          <div
            key={artist.id}
            className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
          >
            <div className="relative shrink-0">
              {artist.imageUrl ? (
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <span className="bg-muted flex size-12 items-center justify-center rounded-full" />
              )}
              <RankBadge rank={index + 1} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium">{artist.name}</h4>
              <p className="text-muted-foreground truncate text-sm">
                {artist.genres.join(", ") || "Artist"}
              </p>
            </div>
            <a
              href={artist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label={`Open ${artist.name} on Spotify`}
            >
              <HugeiconsIcon icon={MusicNote03Icon} size={16} />
            </a>
          </div>
        );
      })}
    </div>
  );
}

function TopTracksRows({ timeRange }: { timeRange: TimeRange }) {
  const { data: topTracks } = useSuspenseQuery(topTracksQueryOptions(timeRange));

  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: VISIBLE_COUNT }).map((_, index) => {
        const track = topTracks[index];
        if (!track) {
          return <EmptyRow key={`track-empty-${index}`} />;
        }

        return (
          <div
            key={track.id}
            className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
          >
            <div className="relative shrink-0">
              {track.imageUrl ? (
                <img
                  src={track.imageUrl}
                  alt={track.albumName}
                  width={48}
                  height={48}
                  className="size-12 rounded object-cover"
                />
              ) : (
                <span className="bg-muted flex size-12 items-center justify-center rounded" />
              )}
              <RankBadge rank={index + 1} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium">{track.name}</h4>
              <p className="text-muted-foreground truncate text-sm">{track.artists}</p>
            </div>
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label={`Open ${track.name} on Spotify`}
            >
              <HugeiconsIcon icon={MusicNote03Icon} size={16} />
            </a>
          </div>
        );
      })}
    </div>
  );
}

function RecentlyPlayedRows() {
  const { data: recentlyPlayed } = useSuspenseQuery(recentlyPlayedQueryOptions);

  return (
    <div className="flex h-full flex-col justify-between p-4">
      {Array.from({ length: VISIBLE_COUNT }).map((_, index) => {
        const item = recentlyPlayed[index];
        if (!item) {
          return <EmptyRow key={`recent-empty-${index}`} />;
        }

        return (
          <div
            key={item.id}
            className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                width={48}
                height={48}
                className="size-12 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="bg-muted flex size-12 shrink-0 items-center justify-center rounded" />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium">{item.name}</h4>
              <p className="text-muted-foreground truncate text-sm">{item.artists}</p>
              <p className="text-muted-foreground text-xs">
                {new Date(item.playedAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label={`Open ${item.name} on Spotify`}
            >
              <HugeiconsIcon icon={MusicNote03Icon} size={16} />
            </a>
          </div>
        );
      })}
    </div>
  );
}

export function SpotifyStatsGrid({ timeRange }: SpotifyStatsGridProps) {
  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="grid md:grid-cols-3">
        <StatsColumn title="Top Artists" icon={UserMultipleIcon} bordered>
          <Suspense fallback={<ColumnRowsSkeleton rounded="rounded-full" />}>
            <TopArtistsRows timeRange={timeRange} />
          </Suspense>
        </StatsColumn>

        <StatsColumn title="Top Tracks" icon={MusicNote03Icon} bordered>
          <Suspense fallback={<ColumnRowsSkeleton />}>
            <TopTracksRows timeRange={timeRange} />
          </Suspense>
        </StatsColumn>

        <StatsColumn title="Recently Played" icon={Clock01Icon}>
          <Suspense fallback={<ColumnRowsSkeleton />}>
            <RecentlyPlayedRows />
          </Suspense>
        </StatsColumn>
      </div>
    </div>
  );
}
