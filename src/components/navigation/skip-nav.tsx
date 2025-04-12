"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SkipNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <Link
      href="#main-content"
      className={cn(
        "fixed right-4 top-16 z-50 -translate-y-16 rounded-md border bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-md transition-transform hover:bg-secondary focus:translate-y-0 focus:ring-2 focus:ring-ring",
        isVisible && "translate-y-0",
      )}
      onClick={() => setIsVisible(false)}
    >
      Skip to content
    </Link>
  );
}
