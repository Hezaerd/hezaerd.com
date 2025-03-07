import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ProjectCardProps {
  index: number;
  title: string;
  description: string;
  thumbnail?: string;
  titleExtra?: ReactNode;
  footerContent?: ReactNode;
}

export function ProjectCard({
  index,
  title,
  description,
  thumbnail,
  titleExtra,
  footerContent,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      whileTap={{ y: 0 }}
    >
      <Card className="group flex h-full flex-col p-4 transition-all duration-200 hover:border-primary hover:shadow-lg">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title}
            className="mb-4 h-48 w-full object-cover"
          />
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-2 flex items-start justify-between"
        >
          <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
            {title}
          </h3>
          {titleExtra}
        </motion.div>
        <p className="mb-4 flex-grow text-sm text-muted-foreground">
          {description || "No description available"}
        </p>
        {footerContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center gap-4 text-sm text-muted-foreground"
          >
            {footerContent}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
