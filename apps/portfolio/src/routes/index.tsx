import { createFileRoute } from "@tanstack/react-router";

import { AboutSection } from "@/components/about-section";
import { HeroSection } from "@/components/hero-section";
import { MusicSection } from "@/components/music-section";
import { ProjectsSection } from "@/components/projects-section";
import { ResumeSection } from "@/components/resume-section";
import { jsonLdScript, pageHead } from "@/lib/seo";
import { site } from "@/lib/site";
import {
  currentlyPlayingQueryOptions,
  recentlyPlayedQueryOptions,
  topArtistsQueryOptions,
  topTracksQueryOptions,
} from "@/lib/spotify-queries";
import { homeJsonLd } from "@/lib/structured-data";
import { DEFAULT_TIME_RANGE, TIME_RANGES } from "@/types/spotify";

export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead({
      title: site.title,
      description: site.description,
      path: "/",
    });

    return {
      ...head,
      scripts: [jsonLdScript(homeJsonLd())],
    };
  },
  loader: async ({ context }) => {
    const { queryClient } = context;

    // Warm the other ranges in the background
    for (const range of TIME_RANGES) {
      if (range.value === DEFAULT_TIME_RANGE) continue;
      void queryClient.prefetchQuery(topArtistsQueryOptions(range.value));
      void queryClient.prefetchQuery(topTracksQueryOptions(range.value));
    }

    await Promise.all([
      queryClient.ensureQueryData(currentlyPlayingQueryOptions),
      queryClient.ensureQueryData(topArtistsQueryOptions(DEFAULT_TIME_RANGE)),
      queryClient.ensureQueryData(topTracksQueryOptions(DEFAULT_TIME_RANGE)),
      queryClient.ensureQueryData(recentlyPlayedQueryOptions),
    ]);
  },
  component: Home,
});

function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <MusicSection />
      <ResumeSection />
    </main>
  );
}
