import { MusicNote03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { CurrentlyPlaying } from "@/components/spotify/currently-playing";
import { SpotifyStatsGrid } from "@/components/spotify/spotify-stats-grid";
import { TimeRangeSelector } from "@/components/spotify/time-range-selector";
import { DEFAULT_TIME_RANGE, type TimeRange } from "@/types/spotify";

export function MusicSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);

  return (
    <Section id="music" className="bg-card px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="font-display text-card-foreground mb-8 flex items-center justify-center gap-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            <HugeiconsIcon icon={MusicNote03Icon} size={28} className="text-primary" />
            My Music Taste
          </h2>
        </Reveal>

        <div className="space-y-8">
          <Reveal delay={0.05}>
            <CurrentlyPlaying />
          </Reveal>

          <Reveal delay={0.08}>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </Reveal>

          <Reveal delay={0.1}>
            <SpotifyStatsGrid timeRange={timeRange} />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
