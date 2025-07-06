"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SendHorizontal, LibraryBig } from "lucide-react";
import { AuroraText } from "@/components/text/aurora-text";

export function Landing() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({ behavior: "smooth" });
  };

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
            <Button
              variant="outline"
              className="relative z-10 flex w-32 items-center justify-center gap-2 border-r text-primary group"
              asChild
            >
              <Link href="/#contact" onClick={handleScroll}>
                <motion.span
                  className="inline-flex items-center gap-2"
                >
                  <span className="relative">
                    Contact me
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  <div className="group-hover:rotate-[-15deg] transition-transform duration-200 ease-out">
                    <SendHorizontal className="h-4 w-4" />
                  </div>
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
