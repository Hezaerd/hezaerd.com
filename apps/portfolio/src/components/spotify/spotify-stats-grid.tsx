import {
  Clock01Icon,
  MusicNote03Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@hezaerd/ui/components/avatar";
import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@hezaerd/ui/components/item";
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
    <Badge
      variant="secondary"
      className="absolute -top-1 -right-1 size-5 justify-center rounded px-0 text-[10px]"
    >
      {rank}
    </Badge>
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

function SpotifyLinkButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      render={
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} />
      }
    >
      <HugeiconsIcon icon={MusicNote03Icon} />
    </Button>
  );
}

function TopArtistsRows({ timeRange }: { timeRange: TimeRange }) {
  const { data: topArtists } = useSuspenseQuery(topArtistsQueryOptions(timeRange));

  return (
    <ItemGroup className="gap-3 p-4">
      {Array.from({ length: VISIBLE_COUNT }).map((_, index) => {
        const artist = topArtists[index];
        if (!artist) {
          return <EmptyRow key={`artist-empty-${index}`} />;
        }

        return (
          <Item key={artist.id} className="flex-nowrap hover:bg-muted/50">
            <ItemMedia className="relative size-12 overflow-visible">
              <Avatar className="size-12">
                {artist.imageUrl ? (
                  <AvatarImage src={artist.imageUrl} alt={artist.name} />
                ) : null}
                <AvatarFallback />
              </Avatar>
              <RankBadge rank={index + 1} />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full min-w-0 truncate">{artist.name}</ItemTitle>
              <ItemDescription className="truncate">
                {artist.genres.join(", ") || "Artist"}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0">
              <SpotifyLinkButton
                href={artist.url}
                label={`Open ${artist.name} on Spotify`}
              />
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

function TopTracksRows({ timeRange }: { timeRange: TimeRange }) {
  const { data: topTracks } = useSuspenseQuery(topTracksQueryOptions(timeRange));

  return (
    <ItemGroup className="gap-3 p-4">
      {Array.from({ length: VISIBLE_COUNT }).map((_, index) => {
        const track = topTracks[index];
        if (!track) {
          return <EmptyRow key={`track-empty-${index}`} />;
        }

        return (
          <Item key={track.id} className="flex-nowrap hover:bg-muted/50">
            <ItemMedia className="relative size-12 overflow-visible">
              {track.imageUrl ? (
                <img
                  src={track.imageUrl}
                  alt={track.albumName}
                  className="size-full rounded-sm object-cover"
                />
              ) : (
                <span className="bg-muted size-full rounded-sm" />
              )}
              <RankBadge rank={index + 1} />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full min-w-0 truncate">{track.name}</ItemTitle>
              <ItemDescription className="truncate">{track.artists}</ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0">
              <SpotifyLinkButton
                href={track.url}
                label={`Open ${track.name} on Spotify`}
              />
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

function RecentlyPlayedRows() {
  const { data: recentlyPlayed } = useSuspenseQuery(recentlyPlayedQueryOptions);

  return (
    <ItemGroup className="gap-3 p-4">
      {Array.from({ length: VISIBLE_COUNT }).map((_, index) => {
        const item = recentlyPlayed[index];
        if (!item) {
          return <EmptyRow key={`recent-empty-${index}`} />;
        }

        return (
          <Item key={item.id} className="flex-nowrap hover:bg-muted/50">
            <ItemMedia className="size-12 overflow-hidden rounded-sm">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="bg-muted size-full" />
              )}
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full min-w-0 truncate">{item.name}</ItemTitle>
              <ItemDescription className="truncate">{item.artists}</ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0">
              <SpotifyLinkButton
                href={item.url}
                label={`Open ${item.name} on Spotify`}
              />
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
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
