"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {}

export const ScrollProgress = React.forwardRef<
  HTMLDivElement,
  ScrollProgressProps
>(({ className, ...props }, ref) => {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // Reset scroll position when route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-16 z-50 h-px origin-left bg-gradient-to-r from-[#FF0080] via-[#38bdf8] to-[#7928CA]",
        className,
      )}
      style={{
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
});

ScrollProgress.displayName = "ScrollProgress";
