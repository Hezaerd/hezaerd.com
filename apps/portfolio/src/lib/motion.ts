import type { Transition, Variants } from "motion/react";

/** Strong ease-out for UI enter / press feedback (easing.dev) */
export const easeOut = [0.23, 1, 0.32, 1] as const;

/** Strong ease-in-out for on-screen movement */
export const easeInOut = [0.77, 0, 0.175, 1] as const;

export const uiTransition: Transition = {
  duration: 0.2,
  ease: easeOut,
};

export const revealTransition: Transition = {
  duration: 0.45,
  ease: easeOut,
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: "translateY(12px)",
  },
  show: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: revealTransition,
  },
};

export const heroContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: "translateY(14px)",
  },
  show: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
};

export function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
