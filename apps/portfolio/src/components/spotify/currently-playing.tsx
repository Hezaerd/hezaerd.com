import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@hezaerd/ui/components/empty";
import { Spinner } from "@hezaerd/ui/components/spinner";
import { MusicNote03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useQuery } from "@tanstack/react-query";

import { currentlyPlayingQueryOptions } from "@/lib/spotify-queries";

export function CurrentlyPlaying() {
  const { data: track, isLoading } = useQuery(currentlyPlayingQueryOptions);

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
        <Spinner />
        <span>Loading…</span>
      </div>
    );
  }

  if (!track) {
    return (
      <Empty className="border-none p-2">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={MusicNote03Icon} />
          </EmptyMedia>
          <EmptyTitle>Not playing</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary mx-auto flex max-w-xl items-center justify-center gap-3 text-sm transition-colors"
    >
      {track.imageUrl ? (
        <img
          src={track.imageUrl}
          alt={track.albumName}
          width={40}
          height={40}
          className="size-10 rounded object-cover"
        />
      ) : (
        <span className="bg-muted flex size-10 items-center justify-center rounded">
          <HugeiconsIcon icon={MusicNote03Icon} size={16} />
        </span>
      )}
      <span className="min-w-0 truncate">
        <span className="text-foreground font-medium">{track.name}</span>
        <span className="text-muted-foreground"> — {track.artists}</span>
      </span>
      {track.isPlaying ? (
        <span
          className="bg-primary size-2 shrink-0 animate-pulse rounded-full"
          aria-label="Playing"
        />
      ) : null}
    </a>
  );
}
