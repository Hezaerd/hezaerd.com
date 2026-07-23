import { Button } from "@hezaerd/ui/components/button";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { useCanHover } from "@/hooks/use-can-hover";
import { scrollBehavior } from "@/lib/motion";

const MotionButton = motion.create(Button);

const backToTopTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: scrollBehavior(),
  });
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canHover = useCanHover();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionButton
          size="icon-lg"
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 z-50 shadow-lg"
          aria-label="Back to top"
          title="Back to top"
          initial={
            prefersReducedMotion
              ? { opacity: 1, transform: "translateY(0px) scale(1)" }
              : { opacity: 0, transform: "translateY(16px) scale(1)" }
          }
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, transform: "translateY(16px) scale(1)" }
          }
          whileHover={
            prefersReducedMotion || !canHover
              ? undefined
              : { transform: "translateY(0px) scale(1.05)" }
          }
          whileTap={
            prefersReducedMotion ? undefined : { transform: "translateY(0px) scale(0.95)" }
          }
          transition={prefersReducedMotion ? { duration: 0 } : backToTopTransition}
        >
          <HugeiconsIcon icon={ArrowUp01Icon} />
        </MotionButton>
      )}
    </AnimatePresence>
  );
}
