"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <div className="text-center text-3xl font-bold dark:text-primary md:text-7xl">
            Hello I'm Hezaerd
          </div>
          <div className="text-center text-xl dark:text-primary md:text-3xl">
            I'm a full stack developer
          </div>
        </motion.div>
      </AuroraBackground>
    </main>
  );
}
