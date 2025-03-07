import { ArrowUpRight, Github } from "lucide-react";
import { motion } from "framer-motion";

export function ArrowLinkIcon() {
  return (
    <ArrowUpRight
      size={20}
      className="transition-opacity duration-200 group-hover:opacity-0"
    />
  );
}

export function GithubLinkIcon() {
  return (
    <Github
      size={20}
      className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    />
  );
}

interface MorphingLinkIconProps {
  showGithub?: boolean;
}

export function MorphingLinkIcon({ showGithub = true }: MorphingLinkIconProps) {
  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center"
    >
      <ArrowLinkIcon />
      {showGithub && <GithubLinkIcon />}
    </motion.div>
  );
}
