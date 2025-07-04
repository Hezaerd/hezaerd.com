"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import GitHubStatsOverview from "./github-stats-overview";
import GitHubProfile from "./github-profile";
import CommitGraph from "./commit-graph";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Github } from "lucide-react";
import { GitHubData } from "@/interfaces/github";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Card Skeleton */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-4" />
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </Card>

      {/* Stats Overview Skeleton */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Commit Graph Skeleton */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex gap-1">
          {[...Array(53)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {[...Array(7)].map((_, j) => (
                <Skeleton key={j} className="w-3 h-3 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function GitHubStats() {
  const { data, error, isLoading } = useSWR<GitHubData>(
    "/api/github/stats",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Github className="h-5 w-5" />
          <h3 className="text-lg font-semibold">GitHub Stats</h3>
        </div>
        <div className="text-center text-muted-foreground py-8">
          Failed to load GitHub stats. Please try again later.
        </div>
      </Card>
    );
  }

    return (
    <div className="space-y-6">
      <GitHubProfile profile={data.profile} />
      <GitHubStatsOverview
        stats={data.stats}
        topLanguages={data.top_languages}
      />
      <CommitGraph contributionGraph={data.contribution_graph} />
    </div>
  );
}