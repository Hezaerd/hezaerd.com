"use client";

import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const jobSequence = [
  "also known as Swann",
  1000,
  "an engine developer",
  1000,
  "a gameplay Developer",
  1000,
  "a software engineer",
  1000,
];

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
          className="relative flex flex-col items-center justify-center gap-4 px-4"
        >
          <div className="text-center text-3xl font-bold text-primary md:text-7xl">
            Hello I'm Hezaerd
          </div>
          <div className="text-xl text-primary md:text-3xl">
            <span className="inline-flex items-center">
              I'm&nbsp;
              <span className="from-primary-gradient to-secondary-gradient bg-gradient-to-r bg-clip-text text-transparent">
                <TypeAnimation
                  sequence={jobSequence}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  style={{ whiteSpace: "nowrap" }}
                />
              </span>
            </span>
          </div>
          <HoverBorderGradient
            className="w-fit"
            as="button"
            containerClassName="rounded-full"
          >
            <a href="/projects" className="text-lg font-semibold">
              Checkout my projects
            </a>
          </HoverBorderGradient>
        </motion.div>
      </AuroraBackground>
    </main>
  );
}
