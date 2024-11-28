"use client";

import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

export default function Home() {
  // const browserLang = navigator.language;
  // const lang = browserLang.split("-")[0];

  return (
    <>
      <section id="hero">
        <AuroraBackground className="flex h-screen flex-col">
          <div className="flex flex-grow flex-col items-center justify-center px-4">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4 text-3xl font-bold text-primary md:text-7xl"
              >
                Hello I&apos;m Hezaerd
              </motion.div>
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
                      sequence={[
                        "also known as Swann",
                        2000,
                        "an engine developer",
                        1000,
                        "a gameplay Developer",
                        1000,
                        "a software engineer",
                        1000,
                      ]}
                      wrapper="span"
                      speed={55}
                      repeat={Infinity}
                      cursor={false}
                      style={{ whiteSpace: "nowrap" }}
                      preRenderFirstString={true}
                    />
                  </span>
                  <span className="sr-only">
                    known as Swann, an engine developer, a gameplay Developer
                    and a software engineer
                  </span>
                </span>
              </motion.div>
            </div>
          </div>
        </AuroraBackground>
      </section>

      {/* <section
        id="cv"
        className="flex h-screen flex-col items-center justify-center"
      >
        <a
          href={`/CV/cv_${lang}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
        >
          <Button>Download CV</Button>
        </a>
      </section> */}
    </>
  );
}
