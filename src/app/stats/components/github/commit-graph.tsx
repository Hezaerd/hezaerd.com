"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";

import type { ContributionGraph } from "@/interfaces/github";

interface CommitGraphProps {
  contributionGraph: ContributionGraph | null;
}

const getContributionColor = (count: number) => {
  if (count === 0) return "bg-[#ebedf0] dark:bg-[#161b22]";
  if (count <= 3) return "bg-[#9be9a8] dark:bg-[#0e4429]";
  if (count <= 6) return "bg-[#40c463] dark:bg-[#006d32]";
  if (count <= 9) return "bg-[#30a14e] dark:bg-[#26a641]";
  return "bg-[#216e39] dark:bg-[#39d353]";
};

export default function CommitGraph({ contributionGraph }: CommitGraphProps) {
  if (!contributionGraph) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Contribution Graph</h3>
        </div>
        <div className="text-center text-muted-foreground py-8">
          Loading contribution data...
        </div>
      </Card>
    );
  }

  const { totalContributions, weeks } = contributionGraph;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Contribution Graph</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>{totalContributions.toLocaleString()} contributions</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.contributionDays.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getContributionColor(
                    day.contributionCount
                  )} transition-colors duration-200`}
                  whileHover={{ scale: 1.2 }}
                  title={`${day.date}: ${day.contributionCount} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22]" />
          <div className="w-3 h-3 rounded-sm bg-[#9be9a8] dark:bg-[#0e4429]" />
          <div className="w-3 h-3 rounded-sm bg-[#40c463] dark:bg-[#006d32]" />
          <div className="w-3 h-3 rounded-sm bg-[#30a14e] dark:bg-[#26a641]" />
          <div className="w-3 h-3 rounded-sm bg-[#216e39] dark:bg-[#39d353]" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}