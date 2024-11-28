"use client";

import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { DownloadCVButton } from "./download-cv-button";

const typeSequence = [
  "also known as Swann",
  2000,
  "an engine developer",
  1000,
  "a gameplay Developer",
  1000,
  "a software engineer",
  1000,
];

export function Hero() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center px-4">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-3xl font-bold text-primary md:text-7xl"
        >
          Hello I&apos;m Hezaerd
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl text-primary md:text-3xl"
        >
          <span className="inline-flex items-center">
            I&apos;m&nbsp;
            <span className="bg-gradient-to-r from-primary-gradient to-secondary-gradient bg-clip-text text-transparent">
              <TypeAnimation
                sequence={typeSequence}
                wrapper="span"
                speed={55}
                repeat={Infinity}
                cursor={false}
                style={{ whiteSpace: "nowrap" }}
                preRenderFirstString={true}
              />
            </span>
            <span className="sr-only">
              known as Swann, an engine developer, a gameplay Developer and a
              software engineer
            </span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 flex justify-center"
        >
          <DownloadCVButton />
        </motion.div>
      </div>
    </div>
  );
}
