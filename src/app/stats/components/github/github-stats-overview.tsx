"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Users,
  Star,
  GitBranch,
  FolderGit2,
  FileText,
  Code,
  TrendingUp
} from "lucide-react";
import TickerNumber from "@/components/text/ticker-number";

import { GitHubStats, TopLanguage } from "@/interfaces/github";

interface GitHubStatsOverviewProps {
  stats: GitHubStats;
  topLanguages: TopLanguage[];
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "text-blue-500"
}: {
  icon: any;
  label: string;
  value: number;
  color?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center gap-3 p-4 rounded-lg bg-card border"
  >
    <div className={`p-2 rounded-lg bg-muted ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">
        <TickerNumber
          number={value}
          duration={1}
          doOnce={true}
        />
      </p>
    </div>
  </motion.div>
);

export default function GitHubStatsOverview({
  stats,
  topLanguages
}: GitHubStatsOverviewProps) {

  console.log(stats);
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5" />
        <h3 className="text-lg font-semibold">GitHub Overview</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={FolderGit2}
          label="Public Repos"
          value={stats.public_repos}
          color="text-green-500"
        />
        <StatCard
          icon={Users}
          label="Followers"
          value={stats.followers}
          color="text-purple-500"
        />
        <StatCard
          icon={Star}
          label="Total Stars"
          value={stats.total_stars}
          color="text-yellow-500"
        />
        <StatCard
          icon={FileText}
          label="Commits (this year)"
          value={stats.total_commits}
          color="text-blue-500"
        />
        <StatCard
          icon={FileText}
          label="Public Gists"
          value={stats.public_gists}
          color="text-orange-500"
        />
        <StatCard
          icon={Users}
          label="Following"
          value={stats.following}
          color="text-pink-500"
        />
      </div>

      {topLanguages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-4 w-4" />
            <h4 className="font-medium">Top Languages</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topLanguages.map((lang, index) => (
              <motion.div
                key={lang.language}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lang.language}</p>
                  <p className="text-xs text-muted-foreground">
                    {lang.count} {lang.count === 1 ? 'repo' : 'repos'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}