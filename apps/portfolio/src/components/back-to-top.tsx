import { Button } from "@hezaerd/ui/components/button";
import { cn } from "@hezaerd/ui/lib/utils";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { useCanHover } from "@/hooks/use-can-hover";
import { scrollBehavior, uiTransition } from "@/lib/motion";

const MotionButton = motion.create(Button);

/** Show after scrolling past this; hide only after dropping below HIDE_BELOW. */
const SHOW_AFTER = 200;
const HIDE_BELOW = 100;

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canHover = useCanHover();
  const allowHoverMotion = !prefersReducedMotion && canHover && isVisible;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      setIsVisible((visible) => {
        if (visible) {
          return scrollTop >= HIDE_BELOW;
        }
        return scrollTop > SHOW_AFTER;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    // Hide immediately so exit doesn't race the smooth scroll.
    setIsVisible(false);
    window.scrollTo({
      top: 0,
      behavior: scrollBehavior(),
    });
  };

  return (
    <MotionButton
      size="icon-lg"
      onClick={scrollToTop}
      className={cn(
        "fixed right-6 bottom-6 z-50 shadow-lg",
        // Button ships `transition-all` + `active:translate-y-px`; both fight Motion.
        "transition-[color,background-color,box-shadow,border-color] duration-(--duration-ui) ease-out active:translate-y-0",
        !isVisible && "pointer-events-none",
      )}
      aria-label="Back to top"
      title="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      initial={false}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: prefersReducedMotion || isVisible ? 0 : 12,
        scale: prefersReducedMotion || isVisible ? 1 : 0.96,
      }}
      whileHover={allowHoverMotion ? { scale: 1.05 } : undefined}
      whileTap={prefersReducedMotion || !isVisible ? undefined : { scale: 0.95 }}
      transition={prefersReducedMotion ? { duration: 0 } : uiTransition}
    >
      <HugeiconsIcon icon={ArrowUp01Icon} />
    </MotionButton>
  );
}
