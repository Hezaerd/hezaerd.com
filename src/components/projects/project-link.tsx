import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ProjectLinkProps {
  href: string;
  children: ReactNode;
}

export function ProjectLink({ href, children }: ProjectLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground transition-colors hover:text-primary"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  );
}
