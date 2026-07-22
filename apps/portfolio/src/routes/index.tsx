import { createFileRoute } from "@tanstack/react-router";

import { AboutSection } from "@/components/about-section";
import { HeroSection } from "@/components/hero-section";
import { MusicSection } from "@/components/music-section";
import { ProjectsSection } from "@/components/projects-section";
import { ResumeSection } from "@/components/resume-section";
import {
  currentlyPlayingQueryOptions,
  recentlyPlayedQueryOptions,
  topArtistsQueryOptions,
  topTracksQueryOptions,
} from "@/lib/spotify-queries";
import { DEFAULT_TIME_RANGE } from "@/types/spotify";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(currentlyPlayingQueryOptions),
      context.queryClient.ensureQueryData(topArtistsQueryOptions(DEFAULT_TIME_RANGE)),
      context.queryClient.ensureQueryData(topTracksQueryOptions(DEFAULT_TIME_RANGE)),
      context.queryClient.ensureQueryData(recentlyPlayedQueryOptions),
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
