import { Star, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectGithubStatsProps {
  stargazers_count?: number;
  forks_count?: number;
}

export function ProjectGithubStats({
  stargazers_count,
  forks_count,
}: ProjectGithubStatsProps) {
  return (
    <>
      {stargazers_count !== undefined && (
        <motion.span
          className="flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          <Star size={16} className="text-yellow-500" fill="currentColor" />
          {stargazers_count}
        </motion.span>
      )}
      {forks_count !== undefined && (
        <motion.span
          className="flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          <GitBranch size={16} />
          {forks_count}
        </motion.span>
      )}
    </>
  );
}
