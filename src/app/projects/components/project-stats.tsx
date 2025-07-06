"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  FolderGit2,
  Star,
  GitBranch,
  Code,
  TrendingUp,
  Users
} from "lucide-react";
import TickerNumber from "@/components/text/ticker-number";

interface ProjectStatsProps {
  totalProjects: number;
  totalStars: number;
  totalForks: number;
  topLanguage: string;
  totalContributions: number;
}

const StatItem = ({
  icon: Icon,
  label,
  value,
  color = "text-blue-500",
  delay = 0
}: {
  icon: any;
  label: string;
  value: number;
  color?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-center gap-3 p-4 rounded-lg bg-card border hover:shadow-md transition-all duration-300"
  >
    <div className={`p-3 rounded-lg bg-muted ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        <TickerNumber
          number={value}
          duration={1.5}
          doOnce={true}
        />
      </p>
    </div>
  </motion.div>
);

export default function ProjectStats({
  totalProjects,
  totalStars,
  totalForks,
  topLanguage,
  totalContributions
}: ProjectStatsProps) {
  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Project Statistics</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatItem
            icon={FolderGit2}
            label="Total Projects"
            value={totalProjects}
            color="text-green-500"
            delay={0.1}
          />
          <StatItem
            icon={Star}
            label="Total Stars"
            value={totalStars}
            color="text-yellow-500"
            delay={0.2}
          />
          <StatItem
            icon={GitBranch}
            label="Total Forks"
            value={totalForks}
            color="text-blue-500"
            delay={0.3}
          />
          <StatItem
            icon={Code}
            label="Top Language"
            value={0}
            color="text-purple-500"
            delay={0.4}
          />
          <StatItem
            icon={Users}
            label="Contributions"
            value={totalContributions}
            color="text-pink-500"
            delay={0.5}
          />
        </div>

        {topLanguage && (
          <motion.div
            className="mt-4 p-3 bg-muted/50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              Most used language: <span className="font-semibold text-foreground">{topLanguage}</span>
            </p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}