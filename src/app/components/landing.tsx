"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AuroraText } from "@/components/text/aurora-text";

export function Landing() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-grow flex-col items-center justify-center px-4">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-2xl font-semibold text-primary sm:text-3xl md:text-5xl lg:text-7xl"
          >
            <span className="inline-flex items-center">
              Hello I&apos;m&nbsp;
              <AuroraText
                speed={0.5}
                colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]}
              >
                Hezaerd
              </AuroraText>
              <span className="sr-only">Hezaerd</span>
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-primary sm:text-xl md:text-2xl lg:text-3xl"
          >
            <span className="inline-flex items-center text-primary/75">
              a&nbsp;
              <span className="underline">software engineer</span>
              <span className="sr-only">software engineer</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="relative z-10 flex items-center gap-2 border-r text-primary"
                asChild
              >
                <Link href="/#contact">
                  Contact me
                  <SendHorizontal className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
